import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
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
