import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import type { TimelineConfig, TimelineDisplayEvent } from "./timeline-config";

export function TimelineCard({
  event,
  index,
  timelineConfig,
}: {
  event: TimelineDisplayEvent;
  index: number;
  timelineConfig: TimelineConfig;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isLeft = index % 2 === 0;
  const categoryStyles =
    timelineConfig.categoryStyles[event.category] ?? timelineConfig.fallbackCategoryStyle;

  return (
    <div
      ref={ref}
      className={`relative flex items-start w-full mb-8 md:mb-12 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      <div className="absolute left-4 top-6 z-10 md:hidden">
        <div className={`w-4 h-4 rounded-full ${categoryStyles.dot} ring-4 ring-white shadow`} />
      </div>
      <div className="hidden md:block absolute left-1/2 top-6 z-10 -translate-x-1/2">
        <div
          className={`w-5 h-5 rounded-full ${categoryStyles.dot} ring-4 ring-white shadow-md`}
        />
      </div>
      <div className="w-10 shrink-0 md:hidden" />

      <motion.div
        initial={{ opacity: 0, x: isLeft ? -40 : 40, y: 20 }}
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full md:w-[calc(50%-2rem)] ${
          isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
        }`}
      >
        <div className="bg-white rounded-[var(--radius-card)] shadow-card hover-lift overflow-hidden border border-[var(--color-border)]">
          {event.imageUrl && (
            <div className="relative w-full">
              <Image
                src={event.imageUrl}
                alt={event.imageAlt || event.title}
                width={800}
                height={450}
                className="w-full h-48 md:h-56 object-cover"
              />
              <span className="absolute bottom-2 right-2 text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded">
                {timelineConfig.imageSourceLabel}
              </span>
            </div>
          )}

          <div className="p-5 md:p-6">
            <span className="inline-block text-sm font-medium text-[var(--color-warm)] bg-[var(--color-bg-warm)] px-3 py-1 rounded-full mb-3">
              {event.date}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-[var(--color-text)] mb-2 leading-snug">
              {event.title}
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm md:text-base leading-relaxed mb-3">
              {event.description}
            </p>
            <span
              className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${categoryStyles.pill} ${categoryStyles.pillText}`}
            >
              {event.category}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
