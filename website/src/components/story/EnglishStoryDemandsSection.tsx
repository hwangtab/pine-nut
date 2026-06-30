"use client";

import { EditableList, EditableText } from "@/components/editable";

export function EnglishStoryDemandsSection() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-[var(--color-bg)]">
      <div className="max-w-3xl mx-auto">
        <EditableText
          contentKey="en.storyPage.demands.heading"
          defaultValue="What Residents Demand"
          as="h2"
          page="en/story"
          section="demands"
          className="text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-10"
        />
        <EditableList
          contentKey="en.storyPage.demands.items"
          defaultItems={[
            { text: "Full cancellation of the pumped-storage power plant plan" },
            { text: "Withdrawal of the Ministry of Trade, Industry and Energy implementation approval notice issued on August 29, 2025" },
            { text: "Permanent protection of the pine forest and surrounding ecosystem" },
            { text: "Protection of residents' livelihoods, homes, and community rights" },
          ]}
          page="en/story"
          section="demands"
          fields={[{ key: "text", label: "Text" }]}
        >
          {(items) => (
            <ul className="space-y-4 mb-16">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-4 text-base md:text-lg text-[var(--color-text)]">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-forest)]/10 text-[var(--color-forest)] flex items-center justify-center font-bold text-sm mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          )}
        </EditableList>

        <blockquote className="border-l-4 border-[var(--color-forest)] pl-6 md:pl-8 py-2">
          <EditableText
            contentKey="en.storyPage.demands.quote"
            defaultValue="We want to protect our forest, our village, and our way of life."
            as="p"
            page="en/story"
            section="demands"
            className="text-xl md:text-2xl lg:text-3xl font-bold text-[var(--color-forest)] leading-snug"
          />
        </blockquote>
      </div>
    </section>
  );
}
