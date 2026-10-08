import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // allow local network dev access from mobile and LAN
  },
  allowedDevOrigins: [
    "192.168.1.5",
    "192.168.1.5:3000",
    "192.168.1.6",
    "192.168.1.6:3000",
    "localhost:3000",
  ],
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://localhost:5001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
