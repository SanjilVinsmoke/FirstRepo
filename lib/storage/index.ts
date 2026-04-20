/**
 * Storage abstraction – swap between local disk and S3-compatible storage
 * by setting STORAGE_PROVIDER=local|s3 in the environment.
 */
import type { StorageProvider } from "./types";

let _provider: StorageProvider | null = null;

export async function getStorage(): Promise<StorageProvider> {
  if (_provider) return _provider;

  const provider = process.env.STORAGE_PROVIDER ?? "local";

  if (provider === "s3") {
    const { S3Storage } = await import("./s3");
    _provider = new S3Storage();
  } else {
    const { LocalStorage } = await import("./local");
    _provider = new LocalStorage();
  }

  return _provider;
}
