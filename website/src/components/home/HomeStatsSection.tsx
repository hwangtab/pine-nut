"use client";

import { EditableList } from "@/components/editable";
import { FadeIn } from "@/components/home/HomeMotion";

export default function HomeStatsSection() {
  return (
    <div className="max-w-6xl mx-auto">
      <EditableList
        contentKey="home.stats.items"
        defaultItems={[
          { number: "2019년~", label: "투쟁 시작" },
          { number: "705회+", label: "집회 횟수" },
          { number: "140개+", label: "연대 단체" },
          { number: "11만+", label: "벌채 예정 잣나무" },
        ]}
        page="home"
        section="stats"
        fields={[
          { key: "number", label: "숫자" },
          { key: "label", label: "라벨" },
        ]}
      >
        {(items) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-4 text-center">
            {items.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--color-earth-light)] mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm sm:text-base text-white/50">
                    {stat.label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </EditableList>
    </div>
  );
}
