/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages / Workers edge runtime compatibility.
  // Per-route: add `export const runtime = 'edge'` in route files that must run on the edge.
  // Global edge: uncomment the line below (disables some Node.js APIs).
  // experimental: { runtime: 'edge' },
};

module.exports = nextConfig;
