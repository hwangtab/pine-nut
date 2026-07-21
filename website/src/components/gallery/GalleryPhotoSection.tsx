"use client";

import { EditableList, EditableText } from "@/components/editable";
import { useReveal } from "@/lib/use-reveal";
import GalleryPhotoCard from "@/components/gallery/GalleryPhotoCard";
import {
  photoFields,
  toGalleryPhoto,
  type EditableGalleryPhoto,
  type GalleryPhoto,
} from "@/components/gallery/gallery-data";

export default function GalleryPhotoSection({
  contentKey,
  titleKey,
  titleDefault,
  descriptionKey,
  descriptionDefault,
  section,
  defaultItems,
  indexOffset,
  onOpen,
  page = "gallery",
  fields = photoFields,
  creditLabel = "사진:",
  openAriaLabel = (title) => `${title} 이미지 크게 보기`,
}: {
  contentKey: string;
  titleKey: string;
  titleDefault: string;
  descriptionKey: string;
  descriptionDefault: string;
  section: string;
  defaultItems: EditableGalleryPhoto[];
  indexOffset: number;
  onOpen: (photo: GalleryPhoto, trigger: HTMLButtonElement) => void;
  page?: string;
  fields?: typeof photoFields;
  creditLabel?: string;
  openAriaLabel?: (title: string) => string;
}) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  return (
    <div className="max-w-5xl mx-auto mb-16 md:mb-24">
      <div
        ref={ref}
        className={`reveal ${inView ? "is-visible" : ""} mb-8`}
      >
        <EditableText
          contentKey={titleKey}
          defaultValue={titleDefault}
          as="h2"
          page={page}
          section={section}
          className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-3"
        />
        <EditableText
          contentKey={descriptionKey}
          defaultValue={descriptionDefault}
          as="p"
          page={page}
          section={section}
          className="text-[var(--color-text-muted)] text-base md:text-lg leading-relaxed max-w-2xl"
        />
      </div>

      <EditableList
        contentKey={contentKey}
        defaultItems={defaultItems}
        page={page}
        section={section}
        fields={fields}
      >
        {(items) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {items.map((item, index) => (
              <GalleryPhotoCard
                key={item.id || index}
                photo={toGalleryPhoto(item, index + indexOffset)}
                index={index}
                onOpen={onOpen}
                creditLabel={creditLabel}
                openAriaLabel={openAriaLabel}
              />
            ))}
          </div>
        )}
      </EditableList>
    </div>
  );
}
