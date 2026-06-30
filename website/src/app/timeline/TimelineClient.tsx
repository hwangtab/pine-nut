"use client";

import { TimelinePage } from "@/components/timeline/TimelinePage";
import { koreanTimelineConfig } from "@/components/timeline/timeline-config";
import type { TimelineEvent } from "@/data/timeline";

export default function TimelineClient({
  timelineEvents,
}: {
  timelineEvents: TimelineEvent[];
}) {
  return (
    <TimelinePage
      timelineEvents={timelineEvents}
      timelineConfig={koreanTimelineConfig}
    />
  );
}
