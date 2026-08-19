"use client";

import { EditableList, EditableText } from "@/components/editable";

export function EnglishStoryTransportSection() {
  return (
    <div className="mt-12">
      <EditableText
        contentKey="en.storyPage.transport.heading"
        defaultValue="Getting to Pungcheon-ri"
        as="h3"
        page="en/story"
        section="transport"
        className="font-serif-display text-xl md:text-2xl font-bold text-[var(--color-forest)] mb-8"
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
            <div className="paper p-6 md:p-8">
              <div className="relative z-[1]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-forest)]/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[var(--color-forest)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 17h.01M16 17h.01M5.2 17H4a1 1 0 01-1-1v-3.6a1 1 0 01.1-.44l1.5-3.2A2 2 0 016.4 7.5h11.2a2 2 0 011.8 1.3l1.5 3.2a1 1 0 01.1.44V16a1 1 0 01-1 1h-1.2M7 17a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-serif-display text-lg font-bold text-[var(--color-text)]">
                    By car
                  </h4>
                </div>
                <ul className="space-y-4 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
                  {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-forest)]" />
                      <span>
                        <strong className="text-[var(--color-text)]">{item.title}</strong>
                        <br />
                        {item.route}
                        <br />
                        <span className="text-[var(--color-forest)] font-semibold">
                          {item.duration}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
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
            <div className="paper p-6 md:p-8">
              <div className="relative z-[1]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-forest)]/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[var(--color-forest)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7v10M16 7v10M6 7h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2zm0 10v2m12-2v2M9 4h6"
                      />
                    </svg>
                  </div>
                  <h4 className="font-serif-display text-lg font-bold text-[var(--color-text)]">
                    Public transit
                  </h4>
                </div>
                <ul className="space-y-4 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
                  {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-forest)]" />
                      <span>
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
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </EditableList>
      </div>
    </div>
  );
}
