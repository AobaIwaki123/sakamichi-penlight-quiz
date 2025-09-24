import bundleAnalyzer from "@next/bundle-analyzer";
import nextPwa from "next-pwa";

const withPwa = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  output: "standalone",
};

// `withPWA` と `withBundleAnalyzer` を組み合わせる
export default withBundleAnalyzer(withPwa(nextConfig));
