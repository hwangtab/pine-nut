"use client";

import { motion } from "framer-motion";
import { EditableList, EditableText } from "@/components/editable";
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
}) {
  return (
    <div className="max-w-5xl mx-auto mb-16 md:mb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <EditableText
          contentKey={titleKey}
          defaultValue={titleDefault}
          as="h2"
          page="gallery"
          section={section}
          className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-3"
        />
        <EditableText
          contentKey={descriptionKey}
          defaultValue={descriptionDefault}
          as="p"
          page="gallery"
          section={section}
          className="text-[var(--color-text-muted)] text-base md:text-lg leading-relaxed max-w-2xl"
        />
      </motion.div>

      <EditableList
        contentKey={contentKey}
        defaultItems={defaultItems}
        page="gallery"
        section={section}
        fields={photoFields}
      >
        {(items) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {items.map((item, index) => (
              <GalleryPhotoCard
                key={item.id || index}
                photo={toGalleryPhoto(item, index + indexOffset)}
                index={index}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}
      </EditableList>
    </div>
  );
}
