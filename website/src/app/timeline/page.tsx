import { getPublishedTimeline } from "@/lib/data/timeline";
import TimelineClient from "./TimelineClient";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const timelineEvents = await getPublishedTimeline();
  return <TimelineClient timelineEvents={timelineEvents} />;
}
