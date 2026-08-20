"use client";

import { useMemo, useState } from "react";
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
  // 연도 탭은 실제 데이터에서 만든다. 설정에 하드코딩하면 관리자가 새 연도의
  // 사건을 등록했을 때 어떤 탭에서도 보이지 않는 항목이 생긴다.
  const years = useMemo<TimelineYearValue[]>(() => {
    const present = [...new Set(timelineEvents.map((event) => event.year))]
      .filter((year) => Number.isFinite(year))
      .sort((a, b) => a - b);
    return [timelineConfig.allYear, ...present];
  }, [timelineEvents, timelineConfig.allYear]);
  const filteredEvents =
    selectedYear === timelineConfig.allYear
      ? timelineEvents
      : timelineEvents.filter((event) => event.year === selectedYear);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[var(--color-bg-warm)]/60 via-[var(--color-bg)] to-[var(--color-bg)]">
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

      <div className="border-t border-b border-[var(--color-border)] bg-[var(--color-bg)] py-6 px-4">
        <EditableText
          contentKey={timelineConfig.quote.contentKey}
          defaultValue={timelineConfig.quote.defaultValue}
          as="p"
          page={timelineConfig.page}
          section="quote"
          className="text-center text-lg font-serif-display text-[var(--color-text-muted)] max-w-2xl mx-auto"
        />
      </div>

      <TimelineYearFilter
        timelineConfig={timelineConfig}
        years={years}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
      />

      <section className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {filteredEvents.length > 0 ? (
          <div className="trail-line relative ml-2 pl-10 space-y-8 md:space-y-10">
            {filteredEvents.map((event) => (
              <TimelineCard key={event.id} event={event} timelineConfig={timelineConfig} />
            ))}
          </div>
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
