import { MetadataRoute } from "next";

const BASE_URL = "https://bluesky-official-accounts.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/contribution/register/complete",
        "/contribution/request/complete",
        "/api/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}