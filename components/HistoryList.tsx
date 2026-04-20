"use client";

import type { HistoryEntry } from "@/types";

interface Props {
  entries: HistoryEntry[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function timeAgo(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export default function HistoryList({ entries }: Props) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      <div className="divide-y divide-gray-800">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-800/30 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-200 truncate">{entry.originalName}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatBytes(entry.originalSize)} → {formatBytes(entry.compressedSize)}
                {" · "}
                {entry.options.methods.join(", ")}
                {" · "}
                {timeAgo(entry.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="rounded-full bg-green-900/30 border border-green-900 px-2.5 py-1 text-xs font-semibold text-green-400">
                -{entry.reductionPct}%
              </span>
              <a
                href={entry.downloadUrl}
                download
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
