import Image from "next/image";
import { useReveal } from "@/lib/use-reveal";
import { PineConeIcon } from "@/components/visuals/ForestLetterMotifs";
import type { TimelineConfig, TimelineDisplayEvent } from "./timeline-config";

export function TimelineCard({
  event,
  timelineConfig,
}: {
  event: TimelineDisplayEvent;
  timelineConfig: TimelineConfig;
}) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  const categoryStyles =
    timelineConfig.categoryStyles[event.category] ?? timelineConfig.fallbackCategoryStyle;

  return (
    <div ref={ref} className="relative">
      <PineConeIcon className="absolute -left-[52px] top-0 w-6 h-8 text-[var(--color-forest)]" />
      <div className={`reveal ${inView ? "is-visible" : ""} paper overflow-hidden`}>
        <div className="relative z-[1]">
          {event.imageUrl && (
            <div className="relative w-full">
              <Image
                src={event.imageUrl}
                alt={event.imageAlt || event.title}
                width={800}
                height={450}
                className="w-full h-48 md:h-56 object-cover"
              />
              <span className="ink-chip absolute bottom-2 right-2">
                {timelineConfig.imageSourceLabel}
              </span>
            </div>
          )}

          <div className="p-5 md:p-6">
            <span className="inline-block text-sm font-bold text-[var(--color-forest)] bg-[var(--color-bg-moss)] px-3 py-1 rounded-full mb-3">
              {event.date}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-[var(--color-text)] mb-2 leading-snug">
              {event.title}
            </h3>
            <p className="whitespace-pre-line text-[var(--color-text-muted)] text-sm md:text-base leading-relaxed mb-3">
              {event.description}
            </p>
            <span
              className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${categoryStyles.pill} ${categoryStyles.pillText}`}
            >
              {event.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
