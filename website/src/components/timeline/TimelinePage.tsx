"use client";

import { useState } from "react";
import SubHero from "@/components/SubHero";
import { EditableText } from "@/components/editable";
import { TimelineCard } from "./TimelineCard";
import { TimelineCta } from "./TimelineCta";
import { TimelineYearFilter } from "./TimelineYearFilter";
import type {
  TimelineConfig,
  TimelineDisplayEvent,
  TimelineYearValue,
} from "./timeline-config";

export function TimelinePage({
  timelineEvents,
  timelineConfig,
}: {
  timelineEvents: TimelineDisplayEvent[];
  timelineConfig: TimelineConfig;
}) {
  const [selectedYear, setSelectedYear] = useState<TimelineYearValue>(
    timelineConfig.allYear,
  );
  const filteredEvents =
    selectedYear === timelineConfig.allYear
      ? timelineEvents
      : timelineEvents.filter((event) => event.year === selectedYear);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[var(--color-bg-warm)]/60 via-[var(--color-bg)] to-stone-50">
      <SubHero
        imageUrl={timelineConfig.hero.imageUrl}
        imageContentKey={timelineConfig.hero.imageContentKey}
        imagePage={timelineConfig.page}
        imageSection={timelineConfig.hero.imageSection}
        title={
          <EditableText
            contentKey={timelineConfig.hero.titleKey}
            defaultValue={timelineConfig.hero.titleDefault}
            as="span"
            page={timelineConfig.page}
            section="hero"
          />
        }
        subtitle={
          <EditableText
            contentKey={timelineConfig.hero.subtitleKey}
            defaultValue={timelineConfig.hero.subtitleDefault}
            as="span"
            page={timelineConfig.page}
            section="hero"
          />
        }
        eyebrow={
          <EditableText
            contentKey={timelineConfig.hero.eyebrowKey}
            defaultValue={timelineConfig.hero.eyebrowDefault}
            as="span"
            page={timelineConfig.page}
            section="hero"
          />
        }
      />

      <div className="border-t border-b border-white/10 bg-[var(--color-bg-warm)] py-6 px-4">
        <EditableText
          contentKey={timelineConfig.quote.contentKey}
          defaultValue={timelineConfig.quote.defaultValue}
          as="p"
          page={timelineConfig.page}
          section="quote"
          className="text-center text-lg italic text-[var(--color-text-muted)] max-w-2xl mx-auto"
        />
      </div>

      <TimelineYearFilter
        timelineConfig={timelineConfig}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
      />

      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16 relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[var(--color-border)] md:hidden" />
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-border)] -translate-x-1/2" />

        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <TimelineCard
              key={event.id}
              event={event}
              index={index}
              timelineConfig={timelineConfig}
            />
          ))
        ) : (
          <p className="text-center text-[var(--color-text-muted)] py-20 text-lg">
            <EditableText
              contentKey={timelineConfig.empty.contentKey}
              defaultValue={timelineConfig.empty.defaultValue}
              as="span"
              page={timelineConfig.page}
              section="empty"
            />
          </p>
        )}
      </section>

      <TimelineCta timelineConfig={timelineConfig} />
    </div>
  );
}
