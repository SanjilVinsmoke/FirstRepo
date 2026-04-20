/**
 * S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.)
 * Activated by setting STORAGE_PROVIDER=s3 in the environment.
 */
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs/promises";
import path from "path";
import os from "os";
import type { StorageProvider } from "./types";

function buildClient(): S3Client {
  const config: ConstructorParameters<typeof S3Client>[0] = {
    region: process.env.S3_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  };
  if (process.env.S3_ENDPOINT) {
    config.endpoint = process.env.S3_ENDPOINT;
    config.forcePathStyle = true;
  }
  return new S3Client(config);
}

export class S3Storage implements StorageProvider {
  private client = buildClient();
  private bucket = process.env.S3_BUCKET!;

  async save(key: string, sourcePath: string): Promise<void> {
    const body = await fs.readFile(sourcePath);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: key.endsWith(".glb") ? "model/gltf-binary" : "model/gltf+json",
      })
    );
  }

  async getLocalPath(key: string): Promise<string> {
    // Download to a temp file for local processing
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );
    const tmp = path.join(os.tmpdir(), path.basename(key));
    const bytes = await (res.Body as any).transformToByteArray();
    await fs.writeFile(tmp, bytes);
    return tmp;
  }

  async getDownloadUrl(key: string): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: 3600 }
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }
}
