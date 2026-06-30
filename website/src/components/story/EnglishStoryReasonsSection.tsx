"use client";

import type { ReactNode } from "react";
import { EditableImage, EditableList, EditableText } from "@/components/editable";

export function EnglishStoryReasonsSection() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto">
        <EditableText
          contentKey="en.storyPage.reasons.heading"
          defaultValue="Why Residents Oppose the Project"
          as="h2"
          page="en/story"
          section="reasons"
          className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-12 text-center"
        />
        <EditableList
          contentKey="en.storyPage.reasons.cards"
          defaultItems={[
            {
              title: "Ecological destruction",
              description:
                "Around 110,000 pine trees are at risk. The 1,800-hectare pine nut forest, habitat for the goral, black woodpecker, and otter, would be permanently damaged.",
              color: "forest",
              icon: "sparkle",
            },
            {
              title: "Livelihood collapse",
              description:
                "About 70% of residents rely on pine nut production. Logging already began in October 2024 when 2,256 trees were cut for road works.",
              color: "earth",
              icon: "money",
            },
            {
              title: "Health impacts",
              description:
                "Noise, dust, and vibration from an 84-month construction period would directly affect mostly elderly residents in their 60s to 80s.",
              color: "warm",
              icon: "heart",
            },
            {
              title: "Community dissolution",
              description:
                "Fifty-one households face submersion and forced relocation. Once the village community is scattered, it cannot simply be rebuilt.",
              color: "sky",
              icon: "people",
            },
          ]}
          page="en/story"
          section="reasons"
          fields={[
            { key: "title", label: "Title" },
            { key: "description", label: "Description", type: "textarea" },
          ]}
        >
          {(items) => {
            const colorMap: Record<
              string,
              { border: string; bg: string; text: string }
            > = {
              forest: {
                border: "border-[var(--color-forest)]/15",
                bg: "bg-[var(--color-forest)]/10",
                text: "text-[var(--color-forest)]",
              },
              earth: {
                border: "border-[var(--color-earth)]/15",
                bg: "bg-[var(--color-earth)]/10",
                text: "text-[var(--color-earth)]",
              },
              warm: {
                border: "border-[var(--color-warm)]/15",
                bg: "bg-[var(--color-warm)]/10",
                text: "text-[var(--color-warm)]",
              },
              sky: {
                border: "border-[var(--color-sky)]/15",
                bg: "bg-[var(--color-sky)]/10",
                text: "text-[var(--color-sky)]",
              },
            };

            const iconMap: Record<string, ReactNode> = {
              sparkle: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              ),
              money: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              ),
              heart: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              ),
              people: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
            };

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {items.map((item, index) => {
                  const color = colorMap[item.color] || colorMap.forest;

                  return (
                    <div key={index} className={`bg-white rounded-2xl p-8 border-2 ${color.border} shadow-sm`}>
                      <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center mb-5`}>
                        <span className={color.text}>
                          {iconMap[item.icon] || iconMap.sparkle}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
                        {item.title}
                      </h3>
                      <p className="text-[var(--color-text-muted)] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          }}
        </EditableList>

        <div className="mt-12 max-w-3xl mx-auto">
          <EditableImage
            contentKey="en.storyPage.reasons.photo"
            defaultSrc="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535385_STD.jpg"
            alt="Damage on Mt. Gari from advance construction"
            page="en/story"
            section="reasons"
            width={1200}
            height={800}
            className="w-full rounded-xl shadow-lg my-6"
          />
          <EditableText
            contentKey="en.storyPage.reasons.photoCaption"
            defaultValue="Photo: OhmyNews"
            as="p"
            page="en/story"
            section="reasons"
            className="text-xs text-[var(--color-text-muted)] mt-1"
          />
        </div>
      </div>
    </section>
  );
}
