import fs from "fs/promises";
import path from "path";
import type { StorageProvider } from "./types";

const UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR
  ? path.resolve(process.env.LOCAL_UPLOAD_DIR)
  : path.resolve(process.cwd(), "uploads");

export class LocalStorage implements StorageProvider {
  private async ensureDir() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }

  async save(key: string, sourcePath: string): Promise<void> {
    await this.ensureDir();
    await fs.copyFile(sourcePath, path.join(UPLOAD_DIR, key));
  }

  async getLocalPath(key: string): Promise<string> {
    return path.join(UPLOAD_DIR, key);
  }

  async getDownloadUrl(key: string): Promise<string> {
    // Served via /api/download/[id] route
    return `/api/download/${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<void> {
    const p = path.join(UPLOAD_DIR, key);
    await fs.unlink(p).catch(() => {});
  }
}
