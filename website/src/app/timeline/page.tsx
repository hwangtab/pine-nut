"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { timelineEvents, type TimelineEvent } from "@/data/timeline";

const YEARS = ["전체", 2019, 2021, 2022, 2023, 2024, 2025, 2026] as const;

const categoryColors: Record<TimelineEvent["category"], { dot: string; pill: string; pillText: string }> = {
  회의: { dot: "bg-green-500", pill: "bg-green-100", pillText: "text-green-800" },
  집회: { dot: "bg-orange-500", pill: "bg-orange-100", pillText: "text-orange-800" },
  법률: { dot: "bg-red-500", pill: "bg-red-100", pillText: "text-red-800" },
  연대: { dot: "bg-blue-500", pill: "bg-blue-100", pillText: "text-blue-800" },
  기타: { dot: "bg-gray-500", pill: "bg-gray-100", pillText: "text-gray-800" },
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
      {/* Timeline dot - mobile (left-aligned) */}
      <div className="absolute left-4 top-6 z-10 md:hidden">
        <div className={`w-4 h-4 rounded-full ${colors.dot} ring-4 ring-white shadow`} />
      </div>

      {/* Timeline dot - desktop (center) */}
      <div className="hidden md:block absolute left-1/2 top-6 z-10 -translate-x-1/2">
        <div className={`w-5 h-5 rounded-full ${colors.dot} ring-4 ring-white shadow-md`} />
      </div>

      {/* Spacer for mobile left alignment */}
      <div className="w-10 shrink-0 md:hidden" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -40 : 40, y: 20 }}
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full md:w-[calc(50%-2rem)] ${
          isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
          {/* Event image */}
          {event.imageUrl && (
            <div className="relative w-full">
              <img
                src={event.imageUrl}
                alt={event.imageAlt || event.title}
                className="w-full h-48 md:h-56 object-cover"
                loading="lazy"
              />
              <span className="absolute bottom-2 right-2 text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded">
                사진 출처: 언론 보도
              </span>
            </div>
          )}

          <div className="p-5 md:p-6">
          {/* Date badge */}
          <span className="inline-block text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-3">
            {event.date}
          </span>

          {/* Title */}
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-snug">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-3">
            {event.description}
          </p>

          {/* Category pill */}
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

export default function TimelinePage() {
  const [selectedYear, setSelectedYear] = useState<(typeof YEARS)[number]>("전체");

  const filteredEvents =
    selectedYear === "전체"
      ? timelineEvents
      : timelineEvents.filter((e) => e.year === selectedYear);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/60 via-white to-stone-50">
      {/* Header */}
      <section className="pt-16 pb-10 md:pt-24 md:pb-14 px-4 text-center bg-gradient-to-b from-amber-50 to-transparent">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4"
        >
          7년의 기록
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base md:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed"
        >
          2019년부터 현재까지, 풍천리 주민들의 발자취
        </motion.p>
      </section>

      {/* Emotional quote banner */}
      <div className="border-t border-b border-gray-200 py-6 px-4">
        <p className="text-center text-lg italic text-gray-500 max-w-2xl mx-auto">
          &ldquo;2019년부터 오늘까지, 단 하루도 쉬지 않았습니다&rdquo;
        </p>
      </div>

      {/* Year filter bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {YEARS.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedYear === year
                    ? "bg-amber-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {year === "전체" ? "전체" : `${year}년`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16 relative">
        {/* Vertical line - mobile (left) */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 md:hidden" />

        {/* Vertical line - desktop (center) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <TimelineCard key={event.id} event={event} index={index} />
          ))
        ) : (
          <p className="text-center text-gray-500 py-20 text-lg">
            해당 연도의 기록이 없습니다.
          </p>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20 px-4 text-center bg-gradient-to-t from-amber-50 to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            이 투쟁에 함께해주세요
          </h2>
          <Link
            href="/petition"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            서명에 참여하기
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
