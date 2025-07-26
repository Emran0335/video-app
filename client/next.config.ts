import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        pathname: "/**", // allow all paths under this domain
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
