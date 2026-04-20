/**
 * glTF-Transform compression pipeline.
 *
 * Each step is independently toggled via CompressionOptions so callers can
 * mix-and-match without touching this file.
 *
 * Geometry codecs (Draco / Meshopt) are mutually exclusive in a single file;
 * if both are selected, Draco takes precedence.
 */
import { Document, NodeIO } from "@gltf-transform/core";
import {
  EXTMeshoptCompression,
  KHRDracoMeshCompression,
  KHRTextureBasisu,
} from "@gltf-transform/extensions";
import {
  dedup,
  draco,
  meshopt,
  prune,
  textureCompress,
  resizeTexture,
} from "@gltf-transform/functions";
import type { CompressionOptions } from "@/types";
import path from "path";
import fs from "fs/promises";

// ─── Native codec lazy-loaders ────────────────────────────────────────────────

async function getDracoCodecs() {
  const draco3d = await import("draco3dgltf");
  const [encoder, decoder] = await Promise.all([
    draco3d.createEncoderModule(),
    draco3d.createDecoderModule(),
  ]);
  return { encoder, decoder };
}

async function getMeshoptCodecs() {
  const { MeshoptEncoder, MeshoptDecoder } = await import("meshoptimizer");
  await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
  return { MeshoptEncoder, MeshoptDecoder };
}

// ─── IO factory ──────────────────────────────────────────────────────────────

async function buildIO(opts: CompressionOptions): Promise<NodeIO> {
  const io = new NodeIO();

  if (opts.methods.includes("draco")) {
    const { encoder, decoder } = await getDracoCodecs();
    io
      .registerExtensions([KHRDracoMeshCompression])
      .registerDependencies({ "draco3d.encoder": encoder, "draco3d.decoder": decoder });
  }

  if (opts.methods.includes("meshopt")) {
    const { MeshoptEncoder, MeshoptDecoder } = await getMeshoptCodecs();
    io
      .registerExtensions([EXTMeshoptCompression])
      .registerDependencies({
        "meshopt.encoder": MeshoptEncoder,
        "meshopt.decoder": MeshoptDecoder,
      });
  }

  if (opts.methods.includes("ktx2")) {
    io.registerExtensions([KHRTextureBasisu]);
  }

  return io;
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

export async function compressGltf(
  inputPath: string,
  outputPath: string,
  opts: CompressionOptions
): Promise<void> {
  const io = await buildIO(opts);
  const doc: Document = await io.read(inputPath);

  // Step 1 – Remove unused data (nodes, meshes, textures, samplers, etc.)
  if (opts.prune) {
    await doc.transform(prune());
  }

  // Step 2 – Merge byte-identical accessors, images, and materials
  if (opts.dedup) {
    await doc.transform(dedup());
  }

  // Step 3 – Downscale textures before encoding to keep file size in check
  if (opts.textureResize > 0) {
    // resizeTexture caps each texture to the given max dimension
    await doc.transform(
      resizeTexture({ size: [opts.textureResize, opts.textureResize] as [number, number] })
    );
  }

  // Step 4 – Geometry compression (Draco takes priority over Meshopt)
  if (opts.methods.includes("draco")) {
    await doc.transform(
      draco({
        // quantizePosition: higher bits = better quality; map user 1–10 → 8–16 bits
        quantizePosition: 8 + opts.dracoLevel - 1,
        quantizeNormal: 8,
        quantizeTexcoord: 10,
        quantizeColor: 8,
        quantizeGeneric: 8,
        quantizationVolume: "scene",
      })
    );
  } else if (opts.methods.includes("meshopt")) {
    const { MeshoptEncoder } = await getMeshoptCodecs();
    await doc.transform(
      meshopt({ encoder: MeshoptEncoder, level: "medium" })
    );
  }

  // Step 5 – KTX2/BasisU GPU-native texture compression
  if (opts.methods.includes("ktx2")) {
    await doc.transform(
      textureCompress({
        targetFormat: "ktx2",
        encoder: await getKtx2Encoder(),
      })
    );
  }

  // Write output: binary GLB or JSON GLTF depending on extension
  const ext = path.extname(outputPath).toLowerCase();
  if (ext === ".glb") {
    const buffer = await io.writeBinary(doc);
    await fs.writeFile(outputPath, buffer);
  } else {
    await io.write(outputPath, doc);
  }
}

// ─── KTX2 encoder (optional dependency) ──────────────────────────────────────

async function getKtx2Encoder(): Promise<unknown> {
  try {
    // basis_universal is an optional peer dep; only required for ktx2 method
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const basis = await import("basis_universal" as string);
    return basis.createBasisEncoder();
  } catch {
    throw new Error(
      "KTX2 texture compression requires the 'basis_universal' package. " +
        "Install it (`npm i basis_universal`) or remove 'ktx2' from compression methods."
    );
  }
}
