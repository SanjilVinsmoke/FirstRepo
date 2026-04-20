import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-8 px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <span>© {new Date().getFullYear()} MeshShrink. Built on glTF-Transform.</span>
        <div className="flex gap-6">
          <Link href="/pricing" className="hover:text-gray-300 transition-colors">Pricing</Link>
          <a href="https://gltf-transform.dev" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
            glTF-Transform docs
          </a>
        </div>
      </div>
    </footer>
  );
}
