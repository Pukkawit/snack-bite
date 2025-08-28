import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      // Configuration for localhost
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000", // Specify the port the app runs on
      },

      // Configuration for vercel.com
      {
        protocol: "https",
        hostname: "vercel.com",
      },

      // Configuration for unsplash.com
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      // Configuration for unsplash.com
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Configuration for unsplash.com
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.asos-media.com",
      },
      {
        protocol: "https",
        hostname: "www.meanblvd.com",
      },
      {
        protocol: "https",
        hostname: "www.jovani.com",
      },
      {
        protocol: "https",
        hostname: "cdn.bhfo.com",
      },
      {
        protocol: "https",
        hostname: "www.windsorstore.com",
      },
      {
        protocol: "https",
        hostname: "meshki.us",
      },
      {
        protocol: "https",
        hostname: "images.levi.com",
      },
    ],
  },
};

export default nextConfig;
