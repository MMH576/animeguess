import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      // AniList CDN domains
      's4.anilist.co',
      'img.ani.me',
      'cdn.anilist.co'
    ],
  },
};

export default nextConfig;
