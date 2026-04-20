"use client";

import type { CompressionMethod, CompressionOptions } from "@/types";

interface Props {
  options: CompressionOptions;
  onChange: (opts: CompressionOptions) => void;
}

const METHOD_LABELS: { id: CompressionMethod; label: string; desc: string }[] = [
  { id: "draco", label: "Draco", desc: "Best geometry compression (recommended)" },
  { id: "meshopt", label: "Meshopt", desc: "Fast CPU/GPU-friendly mesh optimization" },
  { id: "ktx2", label: "KTX2 Textures", desc: "GPU-native texture format (requires basis_universal)" },
];

const TEXTURE_PRESETS = [
  { label: "Original", value: 0 },
  { label: "2048px", value: 2048 },
  { label: "1024px", value: 1024 },
  { label: "512px", value: 512 },
];

export default function CompressionSettings({ options, onChange }: Props) {
  const toggleMethod = (method: CompressionMethod) => {
    const has = options.methods.includes(method);
    const next = has
      ? options.methods.filter((m) => m !== method)
      : [...options.methods, method];
    onChange({ ...options, methods: next });
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 space-y-6">
      <h2 className="font-semibold text-white">Compression settings</h2>

      {/* Method toggles */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Methods</p>
        {METHOD_LABELS.map(({ id, label, desc }) => (
          <label
            key={id}
            className="flex items-start gap-3 rounded-lg border border-gray-800 p-3 cursor-pointer hover:border-gray-700 transition-colors"
          >
            <input
              type="checkbox"
              checked={options.methods.includes(id)}
              onChange={() => toggleMethod(id)}
              className="mt-0.5 h-4 w-4 accent-sky-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-200">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Draco level */}
      {options.methods.includes("draco") && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Draco quantization level
            </p>
            <span className="text-sm font-semibold text-brand-400">{options.dracoLevel}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={options.dracoLevel}
            onChange={(e) => onChange({ ...options, dracoLevel: Number(e.target.value) })}
            className="w-full accent-sky-500"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>Higher quality</span>
            <span>Smaller size</span>
          </div>
        </div>
      )}

      {/* Texture resize */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Texture max resolution
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TEXTURE_PRESETS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...options, textureResize: value })}
              className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                options.textureResize === value
                  ? "border-brand-500 bg-brand-500/10 text-brand-400"
                  : "border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Prune + Dedup */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Optimizations</p>
        {[
          { key: "prune" as const, label: "Prune", desc: "Remove unused nodes and materials" },
          { key: "dedup" as const, label: "Dedup", desc: "Merge identical accessors and textures" },
        ].map(({ key, label, desc }) => (
          <label
            key={key}
            className="flex items-start gap-3 rounded-lg border border-gray-800 p-3 cursor-pointer hover:border-gray-700 transition-colors"
          >
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(e) => onChange({ ...options, [key]: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-sky-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-200">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
