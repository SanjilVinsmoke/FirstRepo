/**
 * POST /api/compress
 * Accepts a multipart/form-data body with:
 *   - file: the GLB/GLTF file
 *   - options: JSON-serialized CompressionOptions
 *
 * Returns: CompressResponse (job metadata + download URL)
 */
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import path from "path";
import fs from "fs/promises";
import { checkRateLimit } from "@/lib/ratelimit";
import { getStorage } from "@/lib/storage";
import { compressGltf } from "@/lib/compression/pipeline";
import { addHistoryEntry } from "@/lib/session";
import type { CompressionJob, CompressionOptions } from "@/types";

const MAX_BYTES = parseInt(process.env.MAX_UPLOAD_BYTES ?? "10485760");
const ALLOWED_EXTS = new Set([".glb", ".gltf"]);
const ALLOWED_MIMES = new Set(["model/gltf-binary", "model/gltf+json", "application/octet-stream"]);

export async function POST(req: NextRequest) {
  // ── Rate limit ──────────────────────────────────────────────────────────
  const limited = await checkRateLimit(req);
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limited.msBeforeNext / 1000)) },
      }
    );
  }

  // ── Parse multipart form ────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body." }, { status: 400 });
  }

  const fileEntry = formData.get("file");
  const optionsRaw = formData.get("options");

  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // ── Validate file type ──────────────────────────────────────────────────
  const ext = path.extname(fileEntry.name).toLowerCase();
  if (!ALLOWED_EXTS.has(ext)) {
    return NextResponse.json(
      { error: "Only .glb and .gltf files are accepted." },
      { status: 415 }
    );
  }

  // ── Validate file size ──────────────────────────────────────────────────
  if (fileEntry.size > MAX_BYTES) {
    const limitMB = (MAX_BYTES / 1024 / 1024).toFixed(0);
    return NextResponse.json(
      { error: `File too large. Free tier limit is ${limitMB} MB.` },
      { status: 413 }
    );
  }

  // ── Parse options ───────────────────────────────────────────────────────
  let options: CompressionOptions;
  try {
    options = optionsRaw ? JSON.parse(optionsRaw as string) : defaultOptions();
  } catch {
    return NextResponse.json({ error: "Invalid options JSON." }, { status: 400 });
  }

  const jobId = uuidv4();
  const tmpDir = os.tmpdir();
  const inputTmp = path.join(tmpDir, `${jobId}-input${ext}`);
  const outputExt = ext === ".gltf" ? ".gltf" : ".glb";
  const outputTmp = path.join(tmpDir, `${jobId}-output${outputExt}`);

  try {
    // Write upload to temp file
    const arrayBuf = await fileEntry.arrayBuffer();
    await fs.writeFile(inputTmp, Buffer.from(arrayBuf));

    const originalSize = fileEntry.size;

    // ── Run compression pipeline ──────────────────────────────────────────
    await compressGltf(inputTmp, outputTmp, options);

    const compressedStats = await fs.stat(outputTmp);
    const compressedSize = compressedStats.size;
    const reductionPct = parseFloat(
      (((originalSize - compressedSize) / originalSize) * 100).toFixed(1)
    );

    // ── Build download URL ────────────────────────────────────────────────
    // On serverless platforms (Vercel) each request runs in its own container,
    // so a file written in this invocation won't exist when /api/download/[id]
    // runs later.  For local storage we embed the compressed bytes as a base64
    // data URL so the client can trigger a download without a second round-trip.
    // For S3 we persist normally and return a presigned URL.
    let downloadUrl: string;
    if (process.env.STORAGE_PROVIDER === "s3") {
      const storage = await getStorage();
      const outputKey = `${jobId}-compressed${outputExt}`;
      await storage.save(outputKey, outputTmp);
      downloadUrl = await storage.getDownloadUrl(outputKey);
    } else {
      const compressedBytes = await fs.readFile(outputTmp);
      const mime = outputExt === ".glb" ? "model/gltf-binary" : "model/gltf+json";
      downloadUrl = `data:${mime};base64,${compressedBytes.toString("base64")}`;
    }

    const job: CompressionJob = {
      id: jobId,
      originalName: fileEntry.name,
      originalSize,
      compressedSize,
      reductionPct,
      status: "done",
      options,
      createdAt: Date.now(),
      downloadUrl,
    };

    // ── Record in session history ─────────────────────────────────────────
    const sessionId = req.cookies.get("session_id")?.value ?? jobId;
    addHistoryEntry(sessionId, {
      id: jobId,
      originalName: fileEntry.name,
      originalSize,
      compressedSize,
      reductionPct,
      createdAt: job.createdAt,
      downloadUrl,
      options,
    });

    const response = NextResponse.json({ job });
    // Issue a session cookie if not already present
    if (!req.cookies.get("session_id")) {
      response.cookies.set("session_id", jobId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return response;
  } catch (err: any) {
    console.error("[compress] pipeline error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Compression failed." },
      { status: 500 }
    );
  } finally {
    // Clean up temp files regardless of success/failure
    await Promise.all([
      fs.unlink(inputTmp).catch(() => {}),
      fs.unlink(outputTmp).catch(() => {}),
    ]);
  }
}

function defaultOptions(): CompressionOptions {
  return {
    methods: ["draco"],
    dracoLevel: 7,
    textureResize: 0,
    prune: true,
    dedup: true,
  };
}
