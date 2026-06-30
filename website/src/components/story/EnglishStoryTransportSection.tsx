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
