import type { Metadata } from "next";
import EnglishPageClient from "./EnglishPageClient";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Save Pungcheon-ri — Stop the Pumped-Storage Power Plant",
  description:
    "Elderly villagers in Pungcheon-ri, South Korea, are fighting to protect their pine nut forests and community from a destructive pumped-storage power plant.",
  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
      ko: "/",
    },
  },
  openGraph: {
    title: "Save Pungcheon-ri — Stop the Pumped-Storage Power Plant",
    description:
      "A 7-year fight to protect a village, a forest, and a way of life. Learn how you can help.",
    type: "website",
    locale: "en_US",
    url: `${SITE_URL}/en`,
  },
};

export default function EnglishPage() {
  return <EnglishPageClient />;
}
