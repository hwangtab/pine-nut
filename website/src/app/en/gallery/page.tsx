"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import SubHero from "@/components/SubHero";
import { EditableLink, EditableList, EditableText } from "@/components/editable";

interface GalleryPhoto {
  id: number;
  title: string;
  url: string;
  credit: string;
  description: string;
}

const beautyPhotos = [
  {
    id: "1",
    title: "Aerial view of Pungcheon-ri",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg",
    credit: "OhmyNews",
    description: "A drone photograph of the mountain village of Pungcheon-ri.",
  },
  {
    id: "2",
    title: "Century-old pine nut forest",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/0722/IE003499236_STD.jpg",
    credit: "OhmyNews",
    description: "The pine nut forest that provides both livelihood and habitat.",
  },
  {
    id: "3",
    title: "Area threatened by lower dam construction",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535386_STD.jpg",
    credit: "OhmyNews",
    description: "The valley that would be submerged if the project goes ahead.",
  },
];

const strugglePhotos = [
  {
    id: "4",
    title: "Residents' protest in 2019",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116512855285_l.jpg",
    credit: "Pressian",
    description: "Residents protesting against the project in the early phase of the struggle.",
  },
  {
    id: "5",
    title: "Street march in town",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116584845825_l.jpg",
    credit: "Pressian",
    description: "A public march demanding the withdrawal of the plant plan.",
  },
  {
    id: "6",
    title: "Police confrontation at county hall",
    url: "https://img1.newsis.com/2024/07/22/NISI20240722_0001608612_web.jpg",
    credit: "Newsis",
    description: "Residents confronting police at Hongcheon County Hall in July 2024.",
  },
];

const solidarityPhotos = [
  {
    id: "7",
    title: "Press conference in front of the presidential office",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535381_STD.jpg",
    credit: "OhmyNews",
    description: "Supporters and residents calling for the cancellation of new pumped-storage plants.",
  },
  {
    id: "8",
    title: "Press conference at the national planning commission",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535382_STD.jpg",
    credit: "OhmyNews",
    description: "Residents speaking publicly after the implementation approval process escalated.",
  },
  {
    id: "9",
    title: "Prayer gathering and solidarity event",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg",
    credit: "OhmyNews",
    description: "National supporters joining the residents in solidarity.",
  },
];

const photoFields = [
  { key: "title" as const, label: "Title" },
  { key: "url" as const, label: "Image URL", type: "url" as const },
  { key: "credit" as const, label: "Credit" },
  { key: "description" as const, label: "Description", type: "textarea" as const },
];

function PhotoCard({
  photo,
  index,
  onOpen,
}: {
  photo: GalleryPhoto;
  index: number;
  onOpen: (photo: GalleryPhoto, trigger: HTMLButtonElement) => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-warm)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
      onClick={(event) => onOpen(photo, event.currentTarget)}
      aria-label={`Open larger image: ${photo.title}`}
    >
      <div className="relative aspect-[4/3] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] bg-[var(--color-bg)]">
        <Image src={photo.url} alt={photo.description} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-10" style={{ background: "linear-gradient(to top, var(--color-overlay-medium) 0%, rgba(0, 0, 0, 0.35) 55%, rgba(0, 0, 0, 0) 100%)" }}>
          <p className="text-white text-sm font-medium leading-snug">{photo.title}</p>
          <p className="text-white/70 text-xs mt-1">Photo: {photo.credit}</p>
        </div>
      </div>
    </motion.button>
  );
}

function Lightbox({ photo, onClose }: { photo: GalleryPhoto; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "var(--color-overlay-strong)" }} onClick={onClose}>
        <motion.div
          ref={dialogRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-4xl w-full"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-lightbox-title"
          aria-describedby="gallery-lightbox-description"
        >
          <button ref={closeButtonRef} type="button" onClick={onClose} className="absolute top-4 right-4 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-[var(--color-overlay-soft)] hover:bg-[var(--color-overlay-soft-hover)] transition-colors" aria-label="Close">
            <X className="w-6 h-6 text-[var(--color-overlay-text)]" />
          </button>
          <Image src={photo.url} alt={photo.description} width={1600} height={1200} className="w-full max-h-[75vh] object-contain rounded-lg" />
          <div className="mt-4 text-center">
            <h3 id="gallery-lightbox-title" className="text-[var(--color-overlay-text)] text-lg font-semibold break-words">{photo.title}</h3>
            <p id="gallery-lightbox-description" className="text-[var(--color-overlay-text-muted)] text-sm mt-1 break-words">{photo.description}</p>
            <p className="text-[var(--color-overlay-text-subtle)] text-xs mt-2 break-words">Photo: {photo.credit}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function toGalleryPhoto(item: { id?: string; title: string; url: string; credit: string; description: string }, index: number): GalleryPhoto {
  return {
    id: item.id ? Number(item.id) : index + 1,
    title: item.title,
    url: item.url,
    credit: item.credit,
    description: item.description,
  };
}

function GallerySection({
  title,
  description,
  items,
  contentKey,
  page,
  section,
  onOpen,
}: {
  title: string;
  description: string;
  items: typeof beautyPhotos;
  contentKey: string;
  page: string;
  section: string;
  onOpen: (photo: GalleryPhoto, trigger: HTMLButtonElement) => void;
}) {
  return (
    <div className="max-w-5xl mx-auto mb-16 md:mb-24 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-3">{title}</h2>
        <p className="text-[var(--color-text-muted)] text-base md:text-lg leading-relaxed max-w-2xl">{description}</p>
      </motion.div>

      <EditableList contentKey={contentKey} defaultItems={items} page={page} section={section} fields={photoFields}>
        {(editableItems) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {editableItems.map((item, index) => (
              <PhotoCard key={item.id || index} photo={toGalleryPhoto(item, index)} index={index} onOpen={onOpen} />
            ))}
          </div>
        )}
      </EditableList>
    </div>
  );
}

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
        <GallerySection
          title="The beauty of Pungcheon-ri"
          description="A mountain village, a pine nut forest, and a landscape that residents say must not be erased."
          items={beautyPhotos}
          contentKey="en.gallery.beauty.photos"
          page="en/gallery"
          section="beauty"
          onOpen={openLightbox}
        />
        <GallerySection
          title="Scenes from the struggle"
          description="Weekly protests, forced confrontations, and the daily work of holding a line for more than seven years."
          items={strugglePhotos}
          contentKey="en.gallery.struggle.photos"
          page="en/gallery"
          section="struggle"
          onOpen={openLightbox}
        />
        <GallerySection
          title="Moments of solidarity"
          description="Residents have not stood alone. National allies, youth groups, and civic organizations have joined the fight."
          items={solidarityPhotos}
          contentKey="en.gallery.solidarity.photos"
          page="en/gallery"
          section="solidarity"
          onOpen={openLightbox}
        />

        <section className="py-16 md:py-20 px-4 text-center bg-gradient-to-t from-[var(--color-bg-warm)] to-transparent">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-lg mx-auto">
            <Camera className="w-10 h-10 text-[var(--color-warm)] mx-auto mb-4" />
            <EditableText contentKey="en.gallery.cta.title" defaultValue="Share more images" as="h2" page="en/gallery" section="cta" className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-3" />
            <EditableText contentKey="en.gallery.cta.description" defaultValue="If you have photos from protests, solidarity visits, or the pine forest itself, please send them to the campaign so the archive can keep growing." as="p" page="en/gallery" section="cta" className="text-[var(--color-text-muted)] mb-6 leading-relaxed" />
            <EditableLink contentKey="en.gallery.cta.href" defaultHref="https://campaigns.do/campaigns/1328" page="en/gallery" section="cta" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--color-warm)] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[var(--color-warm-light)] hover:shadow-xl">
              <EditableText contentKey="en.gallery.cta.submit" defaultValue="Contact the campaign" as="span" page="en/gallery" section="cta" />
            </EditableLink>
          </motion.div>
        </section>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-8 text-center">
        <EditableText contentKey="en.gallery.copyright.text" defaultValue="Photo credits: OhmyNews, Pressian, Newsis, and the Pungcheon-ri opposition committee. Press photographs are used with source attribution." as="p" page="en/gallery" section="copyright" className="text-[var(--color-text-muted)] text-xs leading-relaxed" />
      </div>

      {lightboxPhoto && <Lightbox photo={lightboxPhoto} onClose={closeLightbox} />}
    </div>
  );
}
