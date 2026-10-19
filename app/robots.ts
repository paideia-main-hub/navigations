import type { MetadataRoute } from "next";
import { getSiteHost, getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/dashboard/", "/admin", "/admin/", "/api/", "/login", "/forgot-password", "/reset-password"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: getSiteHost(),
  };
}
