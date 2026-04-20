/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@gltf-transform/core",
      "@gltf-transform/extensions",
      "@gltf-transform/functions",
      "draco3dgltf",
      "meshoptimizer",
      "sharp",
    ],
  },
  api: {
    bodyParser: false,
  },
};

module.exports = nextConfig;
