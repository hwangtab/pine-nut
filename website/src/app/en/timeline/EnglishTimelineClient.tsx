"use client";

import { TimelinePage } from "@/components/timeline/TimelinePage";
import { englishTimelineConfig } from "@/components/timeline/timeline-config";
import type { EnglishTimelineEvent } from "@/lib/i18n/timeline-en";

export default function EnglishTimelineClient({
  timelineEvents,
}: {
  timelineEvents: EnglishTimelineEvent[];
}) {
  return (
    <TimelinePage
      timelineEvents={timelineEvents}
      timelineConfig={englishTimelineConfig}
    />
  );
}
