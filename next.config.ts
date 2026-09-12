import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, far too small for the admin portal's manual/resource/
      // winner-photo uploads (all go through Server Actions, see
      // domain/storage/actions.ts). 20MB comfortably covers PDF manuals.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
