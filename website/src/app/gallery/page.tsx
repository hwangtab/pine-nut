"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import SubHero from "@/components/SubHero";
import { EditableLink, EditableText } from "@/components/editable";
import ManagedSection from "@/components/builder/ManagedSection";
import OrderedSectionGroup from "@/components/builder/OrderedSectionGroup";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import GalleryPhotoSection from "@/components/gallery/GalleryPhotoSection";
import {
  GALLERY_SECTION_ORDER,
  defaultBeautyPhotos,
  defaultSolidarityPhotos,
  defaultStrugglePhotos,
  type GalleryPhoto,
} from "@/components/gallery/gallery-data";

export default function GalleryPage() {
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(
    null
  );
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
      {/* Hero */}
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg"
        imageContentKey="gallery.hero.image"
        imagePage="gallery"
        imageSection="hero"
        title={<EditableText contentKey="gallery.hero.title" defaultValue="갤러리" as="span" page="gallery" section="hero" />}
        subtitle={<EditableText contentKey="gallery.hero.subtitle" defaultValue="풍천리의 현장을 담은 사진들" as="span" page="gallery" section="hero" />}
        eyebrow={<EditableText contentKey="gallery.hero.eyebrow" defaultValue="현장 기록" as="span" page="gallery" section="hero" />}
      />

      <div className="pt-12 md:pt-16">
        <OrderedSectionGroup page="gallery" defaultOrder={[...GALLERY_SECTION_ORDER]}>
          <ManagedSection
            page="gallery"
            sectionId="beauty"
            visibilityContentKey="gallery.beauty.visibility"
            section="beauty"
            defaultClassName="px-4"
          >
            <GalleryPhotoSection
              contentKey="gallery.beauty.photos"
              titleKey="gallery.beauty.title"
              titleDefault="풍천리의 아름다움"
              descriptionKey="gallery.beauty.description"
              descriptionDefault="100년 넘은 잣나무 군락지와 멸종위기 산양이 살아가는 풍천리의 자연. 이 숲은 주민들의 삶의 터전이자, 지켜야 할 생태계의 보고입니다."
              section="beauty"
              defaultItems={defaultBeautyPhotos}
              indexOffset={0}
              onOpen={openLightbox}
            />
          </ManagedSection>

          <ManagedSection
            page="gallery"
            sectionId="struggle"
            visibilityContentKey="gallery.struggle.visibility"
            section="struggle"
            defaultClassName="px-4"
          >
            <GalleryPhotoSection
              contentKey="gallery.struggle.photos"
              titleKey="gallery.struggle.title"
              titleDefault="투쟁의 현장"
              descriptionKey="gallery.struggle.description"
              descriptionDefault="2019년부터 7년이 넘도록 매주 이어온 정기 집회, 680여 차의 기록. 60~80대 어르신들이 마을을 지키기 위해 걸어온 길입니다."
              section="struggle"
              defaultItems={defaultStrugglePhotos}
              indexOffset={defaultBeautyPhotos.length}
              onOpen={openLightbox}
            />
          </ManagedSection>

          <ManagedSection
            page="gallery"
            sectionId="solidarity"
            visibilityContentKey="gallery.solidarity.visibility"
            section="solidarity"
            defaultClassName="px-4"
          >
            <GalleryPhotoSection
              contentKey="gallery.solidarity.photos"
              titleKey="gallery.solidarity.title"
              titleDefault="연대의 순간"
              descriptionKey="gallery.solidarity.description"
              descriptionDefault="전국 140여 개 단체, 청소년에서 시민까지. 풍천리 주민들과 함께 손을 잡은 연대의 순간들입니다."
              section="solidarity"
              defaultItems={defaultSolidarityPhotos}
              indexOffset={defaultBeautyPhotos.length + defaultStrugglePhotos.length}
              onOpen={openLightbox}
            />
          </ManagedSection>

          <ManagedSection
            page="gallery"
            sectionId="cta"
            visibilityContentKey="gallery.cta.visibility"
            section="cta"
            defaultClassName="py-16 md:py-20 px-4 text-center bg-gradient-to-t from-[var(--color-bg-warm)] to-transparent"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-lg mx-auto"
            >
              <Camera className="w-10 h-10 text-[var(--color-warm)] mx-auto mb-4" />
              <EditableText
                contentKey="gallery.cta.title"
                defaultValue="사진을 제보해주세요"
                as="h2"
                page="gallery"
                section="cta"
                className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-3"
              />
              <EditableText
                contentKey="gallery.cta.description"
                defaultValue="풍천리의 아름다운 자연, 투쟁의 현장, 연대의 순간을 담은 사진이 있으시다면 제보해주세요. 함께 기록을 남깁니다."
                as="p"
                page="gallery"
                section="cta"
                className="text-[var(--color-text-muted)] mb-6 leading-relaxed"
              />
              <EditableLink
                contentKey="gallery.cta.href"
                defaultHref="https://campaigns.do"
                page="gallery"
                section="cta"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--color-warm)] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[var(--color-warm-light)] hover:shadow-xl"
              >
                <EditableText
                  contentKey="gallery.cta.submit"
                  defaultValue="사진 제보하기"
                  as="span"
                  page="gallery"
                  section="cta"
                />
              </EditableLink>
            </motion.div>
          </ManagedSection>
        </OrderedSectionGroup>
      </div>

      {/* Copyright notice */}
      <div className="max-w-5xl mx-auto px-4 pb-8 text-center">
        <EditableText
          contentKey="gallery.copyright.text"
          defaultValue="사진 출처: 오마이뉴스, 프레시안, 뉴시스, 풍천리양수발전소반대대책위. 언론 보도 사진은 출처를 표기하여 사용합니다."
          as="p"
          page="gallery"
          section="copyright"
          className="text-[var(--color-text-muted)] text-xs leading-relaxed"
        />
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <GalleryLightbox
          photo={lightboxPhoto}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
