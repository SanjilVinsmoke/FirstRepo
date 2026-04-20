/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep native Node.js packages out of the webpack bundle so they resolve at
  // runtime inside the serverless function (required for gltf-transform codecs)
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

  // Vercel handles body parsing natively; disable Next.js's built-in parser
  // so multipart uploads reach the route handler intact
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

module.exports = nextConfig;
