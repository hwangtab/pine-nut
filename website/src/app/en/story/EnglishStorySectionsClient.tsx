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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
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
              text: "They continued weekly protests in front of the county office through rain, snow, heat, and winter cold. By late 2025 the count had passed 680.",
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

export function EnglishStoryTransportSection() {
  return (
    <div className="mt-12">
      <EditableText
        contentKey="en.storyPage.transport.heading"
        defaultValue="Getting to Pungcheon-ri"
        as="h3"
        page="en/story"
        section="transport"
        className="text-xl md:text-2xl font-bold text-[var(--color-forest)] mb-8 text-center"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EditableList
          contentKey="en.storyPage.transport.car"
          defaultItems={[
            {
              title: "Seoul to Pungcheon-ri",
              route: "Seoul-Yangyang Expressway -> Donghongcheon IC -> Route 44 -> Hwacheon-myeon direction",
              duration: "About 1 hour 30 minutes",
            },
            {
              title: "Chuncheon to Pungcheon-ri",
              route: "Route 5 -> Hongcheon -> Route 44 -> Hwacheon-myeon direction",
              duration: "About 50 minutes",
            },
          ]}
          page="en/story"
          section="transport"
          fields={[
            { key: "title", label: "Title" },
            { key: "route", label: "Route" },
            { key: "duration", label: "Duration" },
          ]}
        >
          {(items) => (
            <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-[var(--color-forest)]/15 shadow-sm">
              <h4 className="text-lg font-bold text-[var(--color-text)] mb-5">
                By car
              </h4>
              <ul className="space-y-4 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
                {items.map((item, index) => (
                  <li key={index}>
                    <strong className="text-[var(--color-text)]">{item.title}</strong>
                    <br />
                    {item.route}
                    <br />
                    <span className="text-[var(--color-forest)] font-semibold">
                      {item.duration}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </EditableList>

        <EditableList
          contentKey="en.storyPage.transport.public"
          defaultItems={[
            {
              title: "Seoul to Hongcheon",
              route: "Intercity bus from Dong Seoul Terminal",
              duration: "About 1 hour 30 minutes",
            },
            {
              title: "Hongcheon to Hwacheon-myeon",
              route: "Local rural bus from Hongcheon Bus Terminal",
              duration: "About 40 minutes",
            },
            {
              title: "Hwacheon-myeon to Pungcheon-ri",
              route: "Village bus or walking",
              duration: "",
            },
          ]}
          page="en/story"
          section="transport"
          fields={[
            { key: "title", label: "Title" },
            { key: "route", label: "Route" },
            { key: "duration", label: "Duration" },
          ]}
        >
          {(items) => (
            <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-[var(--color-forest)]/15 shadow-sm">
              <h4 className="text-lg font-bold text-[var(--color-text)] mb-5">
                Public transit
              </h4>
              <ul className="space-y-4 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
                {items.map((item, index) => (
                  <li key={index}>
                    <strong className="text-[var(--color-text)]">{item.title}</strong>
                    <br />
                    {item.route}
                    {item.duration && (
                      <>
                        <br />
                        <span className="text-[var(--color-forest)] font-semibold">
                          {item.duration}
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </EditableList>
      </div>
    </div>
  );
}
