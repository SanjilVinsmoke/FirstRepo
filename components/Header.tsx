import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <span className="text-2xl">⬡</span>
          MeshShrink
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Compress now
          </Link>
        </nav>
      </div>
    </header>
  );
}
