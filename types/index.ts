export type CompressionMethod = "draco" | "meshopt" | "ktx2";

export interface CompressionOptions {
  methods: CompressionMethod[];
  dracoLevel: number;       // 1–10, higher = smaller file
  textureResize: number;    // max texture dimension, 0 = no resize
  prune: boolean;
  dedup: boolean;
}

export type JobStatus = "pending" | "processing" | "done" | "error";

export interface CompressionJob {
  id: string;
  originalName: string;
  originalSize: number;
  compressedSize?: number;
  reductionPct?: number;
  status: JobStatus;
  error?: string;
  options: CompressionOptions;
  createdAt: number;
  downloadUrl?: string;
}

export interface CompressResponse {
  job: CompressionJob;
}

export interface HistoryEntry {
  id: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  reductionPct: number;
  createdAt: number;
  downloadUrl: string;
  options: CompressionOptions;
}
