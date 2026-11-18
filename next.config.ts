/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    DUGGU_FIREBASE_API_KEY: process.env.DUGGU_FIREBASE_API_KEY,
    DUGGU_FIREBASE_AUTH_DOMAIN: process.env.DUGGU_FIREBASE_AUTH_DOMAIN,
    DUGGU_FIREBASE_PROJECT_ID: process.env.DUGGU_FIREBASE_PROJECT_ID,
    DUGGU_FIREBASE_STORAGE_BUCKET: process.env.DUGGU_FIREBASE_STORAGE_BUCKET,
    DUGGU_FIREBASE_MESSAGING_SENDER_ID: process.env.DUGGU_FIREBASE_MESSAGING_SENDER_ID,
    DUGGU_FIREBASE_APP_ID: process.env.DUGGU_FIREBASE_APP_ID,
    DUGGU_FIREBASE_MEASUREMENT_ID: process.env.DUGGU_FIREBASE_MEASUREMENT_ID,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: https://res.cloudinary.com",
              "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
              "connect-src 'self' https://script.google.com https://www.google-analytics.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.firebaseio.com https://api.cloudinary.com https://res.cloudinary.com https://*.firebaseapp.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
