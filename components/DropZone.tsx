"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onFileAccepted: (file: File) => void;
  loading: boolean;
}

const ACCEPTED_TYPES = {
  "model/gltf-binary": [".glb"],
  "model/gltf+json": [".gltf"],
  "application/octet-stream": [".glb"],
};

export default function DropZone({ onFileAccepted, loading }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) {
        setFileName(accepted[0].name);
        onFileAccepted(accepted[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    disabled: loading,
  });

  const rejected = fileRejections[0];

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer p-10 text-center
        ${isDragActive ? "drag-active" : "border-gray-700 hover:border-gray-600"}
        ${loading ? "pointer-events-none opacity-60" : ""}
      `}
    >
      <input {...getInputProps()} />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-gray-300 font-medium">Compressing…</p>
          <p className="text-sm text-gray-500">This may take a few seconds</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-3xl">
            📦
          </div>
          <div>
            <p className="text-gray-200 font-medium">
              {isDragActive ? "Drop it here!" : "Drag & drop your 3D model"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              .glb or .gltf — up to 10 MB free
            </p>
          </div>
          <button
            type="button"
            className="mt-2 rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
          >
            Browse files
          </button>

          {fileName && !loading && (
            <p className="text-xs text-gray-500 mt-1">Last: {fileName}</p>
          )}
        </div>
      )}

      {rejected && (
        <p className="mt-3 text-sm text-red-400">
          {rejected.errors[0]?.message ?? "Invalid file type. Only .glb and .gltf accepted."}
        </p>
      )}
    </div>
  );
}
