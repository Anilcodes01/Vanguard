import type { NextConfig } from "next";
import createBundleAnalyzerPlugin from "@next/bundle-analyzer";

const withBundleAnalyzer = createBundleAnalyzerPlugin({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "bkplqkefnkgjirnuasqi.supabase.co",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "dnxtgqrbukffopqeobrw.supabase.co",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "**",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);