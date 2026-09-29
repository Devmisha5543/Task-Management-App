import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // allow local network dev access from mobile and LAN
  },
  allowedDevOrigins: ["192.168.1.6", "localhost:3000"],
};

export default nextConfig;
