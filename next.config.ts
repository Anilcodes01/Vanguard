import type { NextConfig } from "next";

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

export default nextConfig;
