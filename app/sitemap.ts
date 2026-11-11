import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://scenes.chat", changeFrequency: "weekly", priority: 1 }];
}
