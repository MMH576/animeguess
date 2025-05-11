/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // This can help with image loading issues in development
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    // Use a much smaller list of critical domains, and let remotePatterns handle the rest
    domains: [
      // Most critical AniList domains
      's4.anilist.co',
      's1.anilist.co',
      's2.anilist.co', 
      's3.anilist.co',
      'img.anili.st',
      'cdn.myanimelist.net',
      'api.jikan.moe',
      'media.kitsu.io',
      'i.imgur.com'
    ]
  },
  // Disable image optimization on external URLs in development
  webpack(config) {
    return config;
  },
  // Add comprehensive CORS headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          // Restrict CORS to your domain instead of allowing all origins
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          { key: 'Timing-Allow-Origin', value: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Surrogate-Control', value: 'no-store' },
        ],
      },
      {
        // Comprehensive CORS headers for all routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        // Special handling for image routes to prevent CORS issues
        source: '/images/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' },
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  }
}

module.exports = nextConfig 