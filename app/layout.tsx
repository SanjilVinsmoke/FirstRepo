import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeshShrink – 3D Model Compression",
  description: "Compress GLB and GLTF 3D model files with Draco, Meshopt, and KTX2 texture compression. Reduce file size by up to 80% while preserving visual quality.",
  keywords: ["glb compression", "gltf compress", "draco", "meshopt", "3d model optimizer"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
