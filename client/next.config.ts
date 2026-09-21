import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    // Proxy API calls to the Express backend (server/). Only added when the
    // backend URL is configured — an unset variable would otherwise rewrite
    // to "undefined/api/v1/…" and break every request.
    const apiUrl = process.env.VITE_API_BASE_URL;
    return apiUrl
      ? [
          {
            source: "/api/v1/:path*",
            destination: `${apiUrl}/api/v1/:path*`,
          },
        ]
      : [];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        // Blog and video assets still hosted by the previous WordPress site.
        protocol: "https",
        hostname: "eleosrein.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        // Admin-supplied image URLs (posts, videos) can live on any https
        // host — the admin pastes the URL when publishing.
        protocol: "https",
        hostname: "**",
      },
    ],
  }
};

export default nextConfig;
