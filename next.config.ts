import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts", "@radix-ui/react-icons"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      },
      {
        source: "/favicon.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
      },
      {
        source: "/portfolio/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }
        ]
      }
    ];
  }
};

const intlConfig = withNextIntl(nextConfig);

export default withSentryConfig(intlConfig, {
  // Sentry organization and project (from your DSN URL)
  org: "magnetic-infratech-ltd",
  project: "javascript-nextjs",

  // Upload source maps to Sentry during production builds
  // Only runs when SENTRY_AUTH_TOKEN is set
  silent: !process.env.CI,
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger in production
  disableLogger: true,

  // Route browser requests to Sentry through a Next.js rewrite to avoid ad blockers
  tunnelRoute: "/monitoring",

  // Upload source maps to Sentry (only when SENTRY_AUTH_TOKEN is set)
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // Automatically annotate React components with their file path
  reactComponentAnnotation: {
    enabled: true,
  },
});
