import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const mediaHostname = process.env.NEXT_PUBLIC_MEDIA_HOST;

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // With `localePrefix: "always"`, visiting `/` (no locale) would 404.
  // Redirect it to the default Persian locale so the root URL always works.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/fa",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3006" },
      { protocol: "http", hostname: "localhost", port: "9002" },
      ...(mediaHostname
        ? [{ protocol: "https" as const, hostname: mediaHostname }]
        : []),
    ],
  },
};

export default withNextIntl(nextConfig);
