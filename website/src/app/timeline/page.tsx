import { getPublishedTimeline } from "@/lib/data/timeline";
import TimelineClient from "./TimelineClient";

export default async function TimelinePage() {
  const timelineEvents = await getPublishedTimeline();
  return <TimelineClient timelineEvents={timelineEvents} />;
}
