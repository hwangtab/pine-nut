import { EditableLink, EditableText } from "@/components/editable";
import { useReveal } from "@/lib/use-reveal";
import type { TimelineConfig } from "./timeline-config";

export function TimelineCta({ timelineConfig }: { timelineConfig: TimelineConfig }) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  return (
    <section className="py-16 md:py-20 px-4 text-center bg-gradient-to-t from-[var(--color-bg-warm)] to-transparent">
      <div ref={ref} className={`reveal ${inView ? "is-visible" : ""}`}>
        <EditableText
          contentKey={timelineConfig.cta.titleKey}
          defaultValue={timelineConfig.cta.titleDefault}
          as="h2"
          page={timelineConfig.page}
          section="cta"
          className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-6"
        />
        <EditableLink
          contentKey={timelineConfig.cta.hrefKey}
          defaultHref={timelineConfig.cta.defaultHref}
          page={timelineConfig.page}
          section="cta"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--color-warm)] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[var(--color-warm-light)] hover:shadow-xl"
        >
          <EditableText
            contentKey={timelineConfig.cta.buttonKey}
            defaultValue={timelineConfig.cta.buttonDefault}
            as="span"
            page={timelineConfig.page}
            section="cta"
          />
        </EditableLink>
      </div>
    </section>
  );
}
