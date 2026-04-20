"use client";

import { useState, useCallback, useEffect } from "react";
import DropZone from "@/components/DropZone";
import CompressionSettings from "@/components/CompressionSettings";
import ResultCard from "@/components/ResultCard";
import HistoryList from "@/components/HistoryList";
import type { CompressionJob, CompressionOptions, HistoryEntry } from "@/types";

const DEFAULT_OPTIONS: CompressionOptions = {
  methods: ["draco"],
  dracoLevel: 7,
  textureResize: 0,
  prune: true,
  dedup: true,
};

export default function DashboardPage() {
  const [options, setOptions] = useState<CompressionOptions>(DEFAULT_OPTIONS);
  const [job, setJob] = useState<CompressionJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history on mount
  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => setHistory(data.history ?? []))
      .catch(() => {});
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      setJob(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("options", JSON.stringify(options));

      try {
        const res = await fetch("/api/compress", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Compression failed.");
        }

        setJob(data.job);
        // Refresh history
        const histRes = await fetch("/api/history");
        const histData = await histRes.json();
        setHistory(histData.history ?? []);
      } catch (err: any) {
        setError(err.message ?? "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">3D Model Compressor</h1>
          <p className="mt-2 text-gray-400">
            Upload a .glb or .gltf file to compress it. Free tier: up to 10 MB.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: upload + settings */}
          <div className="lg:col-span-2 space-y-6">
            <DropZone onFileAccepted={handleUpload} loading={loading} />

            {error && (
              <div className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {job && <ResultCard job={job} />}
          </div>

          {/* Right: settings */}
          <div>
            <CompressionSettings options={options} onChange={setOptions} />
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Recent compressions</h2>
            <HistoryList entries={history} />
          </div>
        )}
      </div>
    </div>
  );
}
