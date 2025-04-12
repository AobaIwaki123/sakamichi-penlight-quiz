import bundleAnalyzer from "@next/bundle-analyzer";
import nextPWA from "next-pwa";

const withPWA = nextPWA({
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
};

// `withPWA` と `withBundleAnalyzer` を組み合わせる
export default withBundleAnalyzer(withPWA(nextConfig));
