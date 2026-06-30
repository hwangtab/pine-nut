"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import SubHero from "@/components/SubHero";
import { EditableLink, EditableText } from "@/components/editable";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import GalleryPhotoSection from "@/components/gallery/GalleryPhotoSection";
import {
  englishBeautyPhotos,
  englishPhotoFields,
  englishSolidarityPhotos,
  englishStrugglePhotos,
  type GalleryPhoto,
} from "@/components/gallery/gallery-data";

const englishOpenAriaLabel = (title: string) => `Open larger image: ${title}`;

export default function EnglishGalleryPage() {
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const openLightbox = useCallback((photo: GalleryPhoto, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setLightboxPhoto(photo);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxPhoto(null);
    requestAnimationFrame(() => {
      lastTriggerRef.current?.focus();
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] via-white to-[var(--color-bg-warm)]/30">
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
        imageContentKey="en.gallery.hero.image"
        imagePage="en/gallery"
        imageSection="hero"
        title={<EditableText contentKey="en.gallery.hero.title" defaultValue="Gallery" as="span" page="en/gallery" section="hero" />}
        subtitle={<EditableText contentKey="en.gallery.hero.subtitle" defaultValue="Images from the forest, the protests, and the solidarity that has grown around Pungcheon-ri" as="span" page="en/gallery" section="hero" />}
        eyebrow={<EditableText contentKey="en.gallery.hero.eyebrow" defaultValue="Field Archive" as="span" page="en/gallery" section="hero" />}
      />

      <div className="pt-12 md:pt-16">
        <div className="px-4">
          <GalleryPhotoSection
            contentKey="en.gallery.beauty.photos"
            titleKey="en.gallery.beauty.title"
            titleDefault="The beauty of Pungcheon-ri"
            descriptionKey="en.gallery.beauty.description"
            descriptionDefault="A mountain village, a pine nut forest, and a landscape that residents say must not be erased."
            section="beauty"
            defaultItems={englishBeautyPhotos}
            indexOffset={0}
            onOpen={openLightbox}
            page="en/gallery"
            fields={englishPhotoFields}
            creditLabel="Photo:"
            openAriaLabel={englishOpenAriaLabel}
          />
        </div>

        <div className="px-4">
          <GalleryPhotoSection
            contentKey="en.gallery.struggle.photos"
            titleKey="en.gallery.struggle.title"
            titleDefault="Scenes from the struggle"
            descriptionKey="en.gallery.struggle.description"
            descriptionDefault="Weekly protests, forced confrontations, and the daily work of holding a line for more than seven years."
            section="struggle"
            defaultItems={englishStrugglePhotos}
            indexOffset={englishBeautyPhotos.length}
            onOpen={openLightbox}
            page="en/gallery"
            fields={englishPhotoFields}
            creditLabel="Photo:"
            openAriaLabel={englishOpenAriaLabel}
          />
        </div>

        <div className="px-4">
          <GalleryPhotoSection
            contentKey="en.gallery.solidarity.photos"
            titleKey="en.gallery.solidarity.title"
            titleDefault="Moments of solidarity"
            descriptionKey="en.gallery.solidarity.description"
            descriptionDefault="Residents have not stood alone. National allies, youth groups, and civic organizations have joined the fight."
            section="solidarity"
            defaultItems={englishSolidarityPhotos}
            indexOffset={englishBeautyPhotos.length + englishStrugglePhotos.length}
            onOpen={openLightbox}
            page="en/gallery"
            fields={englishPhotoFields}
            creditLabel="Photo:"
            openAriaLabel={englishOpenAriaLabel}
          />
        </div>

        <section className="py-16 md:py-20 px-4 text-center bg-gradient-to-t from-[var(--color-bg-warm)] to-transparent">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <Camera className="w-10 h-10 text-[var(--color-warm)] mx-auto mb-4" />
            <EditableText
              contentKey="en.gallery.cta.title"
              defaultValue="Share more images"
              as="h2"
              page="en/gallery"
              section="cta"
              className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-3"
            />
            <EditableText
              contentKey="en.gallery.cta.description"
              defaultValue="If you have photos from protests, solidarity visits, or the pine forest itself, please send them to the campaign so the archive can keep growing."
              as="p"
              page="en/gallery"
              section="cta"
              className="text-[var(--color-text-muted)] mb-6 leading-relaxed"
            />
            <EditableLink
              contentKey="en.gallery.cta.href"
              defaultHref="https://campaigns.do/campaigns/1328"
              page="en/gallery"
              section="cta"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--color-warm)] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[var(--color-warm-light)] hover:shadow-xl"
            >
              <EditableText
                contentKey="en.gallery.cta.submit"
                defaultValue="Contact the campaign"
                as="span"
                page="en/gallery"
                section="cta"
              />
            </EditableLink>
          </motion.div>
        </section>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-8 text-center">
        <EditableText
          contentKey="en.gallery.copyright.text"
          defaultValue="Photo credits: OhmyNews, Pressian, Newsis, and the Pungcheon-ri opposition committee. Press photographs are used with source attribution."
          as="p"
          page="en/gallery"
          section="copyright"
          className="text-[var(--color-text-muted)] text-xs leading-relaxed"
        />
      </div>

      {lightboxPhoto && (
        <GalleryLightbox
          photo={lightboxPhoto}
          onClose={closeLightbox}
          closeLabel="Close"
          creditLabel="Photo:"
        />
      )}
    </div>
  );
}
