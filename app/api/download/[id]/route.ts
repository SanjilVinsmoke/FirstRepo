/**
 * GET /api/download/[id]
 * Streams a compressed file back to the client (local storage only).
 * For S3, the compress route issues a presigned URL directly.
 */
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getStorage } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const key = decodeURIComponent(params.id);

  // Basic path traversal guard
  if (key.includes("..") || path.isAbsolute(key)) {
    return NextResponse.json({ error: "Invalid file key." }, { status: 400 });
  }

  try {
    const storage = await getStorage();

    // If S3, redirect to presigned URL instead of streaming
    if (process.env.STORAGE_PROVIDER === "s3") {
      const url = await storage.getDownloadUrl(key);
      return NextResponse.redirect(url);
    }

    const filePath = await storage.getLocalPath(key);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const isGlb = key.endsWith(".glb");

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": isGlb ? "model/gltf-binary" : "model/gltf+json",
        "Content-Disposition": `attachment; filename="${key}"`,
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[download]", err);
    return NextResponse.json({ error: "Download failed." }, { status: 500 });
  }
}
