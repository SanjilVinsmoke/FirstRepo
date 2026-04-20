import Link from "next/link";

const features = [
  {
    icon: "⚡",
    title: "Draco Compression",
    desc: "Geometry-level compression from Google. Cuts mesh data by 10× while keeping visual fidelity.",
  },
  {
    icon: "🔧",
    title: "Meshopt Compression",
    desc: "Zstandard-backed mesh optimization for smaller files and faster GPU decoding.",
  },
  {
    icon: "🖼️",
    title: "KTX2 Textures",
    desc: "GPU-native texture format. Compresses texture memory and speeds up loading.",
  },
  {
    icon: "🧹",
    title: "Prune & Dedup",
    desc: "Automatically removes unused nodes, materials, and duplicate accessors.",
  },
  {
    icon: "📏",
    title: "Texture Resize",
    desc: "Cap texture dimensions to reduce size without touching geometry.",
  },
  {
    icon: "📦",
    title: "S3-Ready Storage",
    desc: "Drop-in S3 / R2 / MinIO storage abstraction for production deployments.",
  },
];

const stats = [
  { label: "Average size reduction", value: "70%" },
  { label: "Supported formats", value: "GLB & GLTF" },
  { label: "Compression methods", value: "3" },
  { label: "Free file limit", value: "10 MB" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6 text-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="inline-block rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1 text-sm font-medium text-brand-400 mb-6">
            GLB &amp; GLTF Compression as a Service
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Shrink your 3D models.{" "}
            <span className="text-brand-400">Keep the quality.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-400 leading-relaxed">
            Upload a GLB or GLTF file and get back a compressed version in seconds.
            Draco, Meshopt, and KTX2 — all in one pipeline.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg hover:bg-brand-600 transition-colors"
            >
              Compress a file →
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-gray-700 px-8 py-3 font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-brand-400">{s.value}</p>
              <p className="mt-1 text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Everything you need to optimize 3D assets
          </h2>
          <p className="text-center text-gray-400 mb-16">
            Built on glTF-Transform — the industry-standard glTF processing library.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 hover:border-gray-700 transition-colors"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-gray-800">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to compress your first model?
        </h2>
        <p className="text-gray-400 mb-8">Free up to 10 MB. No signup required.</p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-brand-500 px-10 py-3 font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          Get started for free →
        </Link>
      </section>
    </div>
  );
}
