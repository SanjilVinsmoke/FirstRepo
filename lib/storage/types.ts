export interface StorageProvider {
  /** Persist a file and return a stable key for later retrieval */
  save(key: string, sourcePath: string): Promise<void>;
  /** Return a local filesystem path (or temp-download path) for processing */
  getLocalPath(key: string): Promise<string>;
  /** Return a publicly accessible (or presigned) download URL */
  getDownloadUrl(key: string): Promise<string>;
  /** Remove a file (cleanup after TTL, etc.) */
  delete(key: string): Promise<void>;
}
