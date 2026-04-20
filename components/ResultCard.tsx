"use client";

import type { CompressionJob } from "@/types";

interface Props {
  job: CompressionJob;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ResultCard({ job }: Props) {
  if (job.status === "error") {
    return (
      <div className="rounded-xl border border-red-800 bg-red-900/20 p-5">
        <p className="text-red-300 font-medium">Compression failed</p>
        <p className="text-sm text-red-400 mt-1">{job.error}</p>
      </div>
    );
  }

  const reduction = job.reductionPct ?? 0;
  const isGood = reduction >= 30;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Compression result</h3>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            isGood
              ? "bg-green-500/10 text-green-400 border border-green-800"
              : "bg-yellow-500/10 text-yellow-400 border border-yellow-800"
          }`}
        >
          -{reduction}% size
        </span>
      </div>

      {/* Size comparison */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-gray-800/60 p-3">
          <p className="text-xs text-gray-500 mb-1">Original</p>
          <p className="text-base font-semibold text-gray-200">
            {formatBytes(job.originalSize)}
          </p>
        </div>
        <div className="flex items-center justify-center text-2xl text-gray-600">→</div>
        <div className="rounded-lg bg-green-900/20 border border-green-900 p-3">
          <p className="text-xs text-gray-500 mb-1">Compressed</p>
          <p className="text-base font-semibold text-green-300">
            {job.compressedSize ? formatBytes(job.compressedSize) : "—"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Size reduction</span>
          <span>{reduction}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-green-500 transition-all"
            style={{ width: `${Math.min(reduction, 100)}%` }}
          />
        </div>
      </div>

      {/* File name and methods */}
      <div className="text-xs text-gray-500">
        <span className="font-medium text-gray-400">{job.originalName}</span>
        {" · "}
        {job.options.methods.join(", ")}
        {job.options.prune && " · prune"}
        {job.options.dedup && " · dedup"}
      </div>

      {/* Download */}
      {job.downloadUrl && (
        <a
          href={job.downloadUrl}
          download
          className="block w-full rounded-lg bg-brand-500 px-4 py-3 text-center font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          Download compressed file
        </a>
      )}
    </div>
  );
}
