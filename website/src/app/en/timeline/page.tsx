import type { Metadata } from "next";
import { getPublishedTimeline } from "@/lib/data/timeline";
import { translateTimelineEventsToEnglish } from "@/lib/i18n/timeline-en";
import EnglishTimelineClient from "./EnglishTimelineClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Timeline — Save Pungcheon-ri",
  description:
    "A chronological record of the residents' resistance to the Hongcheon pumped-storage power plant from 2019 to 2026.",
  alternates: {
    canonical: "/en/timeline",
    languages: {
      en: "/en/timeline",
      ko: "/timeline",
    },
  },
};

export default async function EnglishTimelinePage() {
  const timelineEvents = await getPublishedTimeline();
  return (
    <EnglishTimelineClient
      timelineEvents={translateTimelineEventsToEnglish(timelineEvents)}
    />
  );
}
