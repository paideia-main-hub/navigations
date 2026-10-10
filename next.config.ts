import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  experimental: {
    // Dashboard pages are personal, so they stay dynamic. Keep the last result
    // in this browser so the next click opens at once instead of waiting on
    // Supabase again. A save still refreshes the affected pages.
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
    transitionIndicator: true,
    serverActions: {
      // Default is 1MB, far too small for the admin portal's manual/resource/
      // winner-photo uploads (all go through Server Actions, see
      // domain/storage/actions.ts). 20MB comfortably covers PDF manuals.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
