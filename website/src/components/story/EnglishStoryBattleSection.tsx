"use client";

import { EditableList, EditableText } from "@/components/editable";

export function EnglishStoryBattleSection() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg-warm)]">
      <div className="max-w-3xl mx-auto">
        <EditableText
          contentKey="en.storyPage.battle.heading"
          defaultValue="How Residents Have Fought Back"
          as="h2"
          page="en/story"
          section="battle"
          className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
        />
        <EditableList
          contentKey="en.storyPage.battle.timeline"
          defaultItems={[
            {
              year: "2019",
              text: "Residents formed an opposition committee and unanimously declared that they would reject the project.",
            },
            {
              year: "Weekly",
              text: "They continued weekly protests in front of the county office through rain, snow, heat, and winter cold. As of July 2026 the count had passed 705.",
            },
            {
              year: "2024.7",
              text: "After a confrontation at Hongcheon County Hall, seven residents aged 60 to 80 were indicted for refusing to vacate and faced fines totaling 18 million KRW.",
            },
            {
              year: "Solidarity",
              text: "More than 140 organizations joined the struggle, including national anti-pumped-storage networks, faith-based environmental groups, regional green groups, and youth climate activists.",
            },
            {
              year: "Travel",
              text: "Residents repeatedly traveled to Seoul to speak at the National Assembly and government offices despite their age and long travel times.",
            },
            {
              year: "Principle",
              text: "The struggle has always been conducted through lawful, democratic means. Residents fought with their voices, not violence.",
            },
          ]}
          page="en/story"
          section="battle"
          fields={[
            { key: "year", label: "Period" },
            { key: "text", label: "Text", type: "textarea" },
          ]}
        >
          {(items) => (
            <div className="space-y-8">
              {items.map((item, index) => (
                <div key={index} className="flex gap-5 md:gap-8">
                  <div className="shrink-0 w-24 md:w-28">
                    <span className="inline-block bg-[var(--color-forest)] text-white text-xs md:text-sm font-bold px-2.5 md:px-3 py-1.5 rounded-full whitespace-nowrap">
                      {item.year}
                    </span>
                  </div>
                  <p className="text-[var(--color-text)] leading-relaxed text-base md:text-lg pt-0.5">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </EditableList>
      </div>
    </section>
  );
}
