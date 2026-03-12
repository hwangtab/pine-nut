import type { Metadata } from "next";
import { getPublishedNews } from "@/lib/data/news";
import { translateNewsItemsToEnglish } from "@/lib/i18n/news-en";
import EnglishNewsListClient from "./EnglishNewsListClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News — Save Pungcheon-ri",
  description:
    "Latest coverage and campaign updates from the fight to stop the pumped-storage power plant in Pungcheon-ri.",
  alternates: {
    canonical: "/en/news",
    languages: {
      en: "/en/news",
      ko: "/news",
    },
  },
};

export default async function EnglishNewsPage() {
  const newsItems = await getPublishedNews();
  return (
    <EnglishNewsListClient
      newsItems={translateNewsItemsToEnglish(newsItems)}
    />
  );
}
