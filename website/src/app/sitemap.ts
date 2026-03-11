import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { url: "/", priority: 1.0 },
    { url: "/story", priority: 0.9 },
    { url: "/timeline", priority: 0.8 },
    { url: "/petition", priority: 0.9 },
    { url: "/donate", priority: 0.8 },
    { url: "/news", priority: 0.8 },
    { url: "/gallery", priority: 0.6 },
    { url: "/press", priority: 0.7 },
    { url: "/share", priority: 0.7 },
    { url: "/en", priority: 0.5 },
    { url: "/privacy", priority: 0.3 },
  ];

  return pages.map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.url === "/news" ? "daily" : "weekly",
    priority: page.priority,
  }));
}
