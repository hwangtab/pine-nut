"use client";

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
          className="font-serif-display text-2xl md:text-3xl font-bold text-[var(--color-forest)] mb-12"
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
          {(items) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {items.map((item, index) => (
                <div key={index} className="paper h-full p-8">
                  <div className="relative z-[1]">
                    <span
                      aria-hidden="true"
                      className="font-serif-display text-sm font-bold tracking-[0.25em] text-[var(--color-forest)]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-serif-display font-bold text-2xl mt-3 mb-4 text-[var(--color-text)]">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-[var(--color-text)]/85">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </EditableList>

        <div className="mt-12 max-w-3xl mx-auto">
          <figure className="photo-frame paper-tilt-l">
            <EditableImage
              contentKey="en.storyPage.reasons.photo"
              defaultSrc="https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003535385_std.jpg"
              alt="Damage on Mt. Gari from advance construction"
              page="en/story"
              section="reasons"
              width={1200}
              height={800}
              className="w-full rounded-[2px]"
            />
            <figcaption>
              <EditableText
                contentKey="en.storyPage.reasons.photoCaption"
                defaultValue="Photo: OhmyNews"
                as="p"
                page="en/story"
                section="reasons"
                className="font-serif-display italic text-lg text-[var(--color-text-muted)] mt-2 text-right pr-1"
              />
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
