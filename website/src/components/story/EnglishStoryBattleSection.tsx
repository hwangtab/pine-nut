"use client";

import { EditableList, EditableText } from "@/components/editable";
import { PineConeIcon } from "@/components/visuals/ForestLetterMotifs";

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
          className="font-serif-display text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
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
            <div className="trail-line relative ml-2 space-y-12 pl-10">
              {items.map((item, index) => (
                <div key={index} className="relative">
                  <PineConeIcon
                    className="absolute -left-[52px] top-0 w-6 h-8 text-[var(--color-forest)]"
                  />
                  <h3 className="font-serif-display font-bold text-2xl mb-2 text-[var(--color-text)]">
                    {item.year}
                  </h3>
                  <p className="max-w-xl leading-relaxed text-[var(--color-text-muted)] [overflow-wrap:anywhere]">
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
