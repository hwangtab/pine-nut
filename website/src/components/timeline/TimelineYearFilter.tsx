import { EditableText } from "@/components/editable";
import type { TimelineConfig, TimelineYearValue } from "./timeline-config";

export function TimelineYearFilter({
  timelineConfig,
  selectedYear,
  onSelectYear,
}: {
  timelineConfig: TimelineConfig;
  selectedYear: TimelineYearValue;
  onSelectYear: (year: TimelineYearValue) => void;
}) {
  return (
    <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex w-full gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 justify-start sm:justify-center">
          {timelineConfig.years.map((year) => (
            <button
              key={year}
              onClick={() => onSelectYear(year)}
              className={`shrink-0 min-h-[44px] px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedYear === year
                  ? "bg-[var(--color-warm)] text-white shadow-md"
                  : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
              }`}
            >
              {timelineConfig.formatYear(year)}
            </button>
          ))}
        </div>
        <EditableText
          contentKey={timelineConfig.filterHint.contentKey}
          defaultValue={timelineConfig.filterHint.defaultValue}
          as="p"
          page={timelineConfig.page}
          section="filter"
          className="mt-2 text-xs text-[var(--color-text-muted)] sm:hidden"
        />
      </div>
    </div>
  );
}
