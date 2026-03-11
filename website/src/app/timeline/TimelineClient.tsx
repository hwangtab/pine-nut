"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SubHero from "@/components/SubHero";
import type { TimelineEvent } from "@/data/timeline";

const YEARS = ["전체", 2019, 2021, 2022, 2023, 2024, 2025, 2026] as const;

const categoryColors: Record<TimelineEvent["category"], { dot: string; pill: string; pillText: string }> = {
  회의: { dot: "bg-[var(--color-forest)]", pill: "bg-[var(--color-forest)]/10", pillText: "text-[var(--color-forest)]" },
  집회: { dot: "bg-[var(--color-warm)]", pill: "bg-[var(--color-warm)]/10", pillText: "text-[var(--color-warm)]" },
  법률: { dot: "bg-red-500", pill: "bg-red-100", pillText: "text-red-800" },
  연대: { dot: "bg-[var(--color-sky)]", pill: "bg-[var(--color-sky)]/10", pillText: "text-[var(--color-sky)]" },
  기타: { dot: "bg-[var(--color-earth)]", pill: "bg-[var(--color-earth)]/10", pillText: "text-[var(--color-earth)]" },
};

function TimelineCard({ event, index }: { event: TimelineEvent; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isLeft = index % 2 === 0;
  const colors = categoryColors[event.category];

  return (
    <div
      ref={ref}
      className={`relative flex items-start w-full mb-8 md:mb-12 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      <div className="absolute left-4 top-6 z-10 md:hidden">
        <div className={`w-4 h-4 rounded-full ${colors.dot} ring-4 ring-white shadow`} />
      </div>
      <div className="hidden md:block absolute left-1/2 top-6 z-10 -translate-x-1/2">
        <div className={`w-5 h-5 rounded-full ${colors.dot} ring-4 ring-white shadow-md`} />
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
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-[var(--color-border)]">
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
                사진 출처: 언론 보도
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
              className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${colors.pill} ${colors.pillText}`}
            >
              {event.category}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function TimelineClient({ timelineEvents }: { timelineEvents: TimelineEvent[] }) {
  const [selectedYear, setSelectedYear] = useState<(typeof YEARS)[number]>("전체");

  const filteredEvents =
    selectedYear === "전체"
      ? timelineEvents
      : timelineEvents.filter((e) => e.year === selectedYear);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[var(--color-bg-warm)]/60 via-[var(--color-bg)] to-stone-50">
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg"
        title="7년의 기록"
        subtitle="2019년부터 현재까지, 풍천리 주민들의 발자취"
        eyebrow="투쟁 연대기"
      />

      <div className="border-t border-b border-white/10 bg-[var(--color-bg-warm)] py-6 px-4">
        <p className="text-center text-lg italic text-[var(--color-text-muted)] max-w-2xl mx-auto">
          {"\u201C"}2019년부터 오늘까지, 단 하루도 쉬지 않았습니다{"\u201D"}
        </p>
      </div>

      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex w-full gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 justify-start sm:justify-center">
            {YEARS.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedYear === year
                    ? "bg-[var(--color-warm)] text-white shadow-md"
                    : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
                }`}
              >
                {year === "전체" ? "전체" : `${year}년`}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)] sm:hidden">
            좌우로 스크롤해 연도를 확인하세요.
          </p>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16 relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[var(--color-border)] md:hidden" />
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-border)] -translate-x-1/2" />

        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <TimelineCard key={event.id} event={event} index={index} />
          ))
        ) : (
          <p className="text-center text-[var(--color-text-muted)] py-20 text-lg">
            해당 연도의 기록이 없습니다.
          </p>
        )}
      </section>

      <section className="py-16 md:py-20 px-4 text-center bg-gradient-to-t from-[var(--color-bg-warm)] to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-6">
            이 투쟁에 함께해주세요
          </h2>
          <Link
            href="/petition"
            className="inline-block bg-[var(--color-warm)] hover:brightness-110 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            서명에 참여하기
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
