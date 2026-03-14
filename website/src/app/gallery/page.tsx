"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import SubHero from "@/components/SubHero";
import { EditableLink, EditableText, EditableList } from "@/components/editable";
import ManagedSection from "@/components/builder/ManagedSection";
import OrderedSectionGroup from "@/components/builder/OrderedSectionGroup";

interface GalleryPhoto {
  id: number;
  title: string;
  url: string;
  credit: string;
  description: string;
}

const GALLERY_SECTION_ORDER = [
  "beauty",
  "struggle",
  "solidarity",
  "cta",
] as const;

const defaultBeautyPhotos = [
  {
    id: "1",
    title: "드론으로 본 풍천리 전경",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535387_STD.jpg",
    credit: "오마이뉴스",
    description: "가리산 자락에 자리한 풍천리 마을의 항공 촬영 사진",
  },
  {
    id: "2",
    title: "100년 잣나무숲",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/0722/IE003499236_STD.jpg",
    credit: "오마이뉴스",
    description: "전국 최고 품질의 잣을 생산하는 풍천리 잣나무숲",
  },
  {
    id: "3",
    title: "하부댐 건설 예정 지역",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535386_STD.jpg",
    credit: "오마이뉴스",
    description: "양수발전소 하부댐으로 수몰될 위기의 풍천리 계곡",
  },
];

const defaultStrugglePhotos = [
  {
    id: "4",
    title: "주민들의 거리 집회 (2019)",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116512855285_l.jpg",
    credit: "풍천리양수발전소반대대책위 / 프레시안",
    description: "2019년 양수발전소 건설 반대를 외치는 풍천리 주민들",
  },
  {
    id: "5",
    title: "시내 거리 행진 (2019)",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116584845825_l.jpg",
    credit: "풍천리양수발전소반대대책위 / 프레시안",
    description: "2019년 양수발전소 건립 철회를 요구하는 시내 집회",
  },
  {
    id: "6",
    title: "홍천군청 경찰 대치 (2024)",
    url: "https://img1.newsis.com/2024/07/22/NISI20240722_0001608612_web.jpg",
    credit: "뉴시스",
    description: "2024년 7월 홍천군청에서 경찰과 대치하는 주민들",
  },
  {
    id: "7",
    title: "농성장 철거 (2020)",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116580311974_l.jpg",
    credit: "풍천리양수발전소반대대책위 / 프레시안",
    description: "2020년 홍천군청 인근 농성장이 철거되는 모습",
  },
  {
    id: "8",
    title: "가리산 훼손 현장",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535385_STD.jpg",
    credit: "오마이뉴스",
    description: "이설도로 공사로 훼손되고 있는 56번 도로 부근 가리산",
  },
  {
    id: "9",
    title: "드론 촬영 댐 계획 부지",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116565874407_l.jpg",
    credit: "풍천리양수발전소반대대책위 / 프레시안",
    description:
      "드론으로 촬영한 댐 건설 계획 부지. 이설도로 공사로 벌목된 산이 보인다",
  },
  {
    id: "10",
    title: "마을 반대 플래카드",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535384_STD.jpg",
    credit: "오마이뉴스",
    description:
      "'댐 2개 양수발전소가 관광자원? 아무도 믿지 않을 거짓말!' 풍천리 마을 플래카드",
  },
];

const defaultSolidarityPhotos = [
  {
    id: "11",
    title: "대통령실 앞 기자회견 (2025.6)",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535381_STD.jpg",
    credit: "오마이뉴스",
    description:
      "2025년 6월 10일 대통령실 앞에서 열린 양수발전소 건설반대 기자회견",
  },
  {
    id: "12",
    title: "국정기획위 기자회견 (2025.8)",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535382_STD.jpg",
    credit: "오마이뉴스",
    description:
      "2025년 8월 1일 국정기획위원회 앞 기자회견장의 풍천리 주민들",
  },
  {
    id: "13",
    title: "강원생명평화기도회 (2025.8)",
    url: "https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg",
    credit: "오마이뉴스",
    description:
      "2025년 8월 22일 강원생명평화기도회에 모인 연대 참가자들",
  },
  {
    id: "14",
    title: "시민공모전 대상 수상 (2025.10)",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111116494078758_l.JPG",
    credit: "프레시안 (손가영 기자)",
    description:
      "한국내셔널트러스트 '이곳만은 지키자' 시민공모전에서 대상을 수상한 주민들",
  },
  {
    id: "15",
    title: "672차 결의대회 (2025.10)",
    url: "https://www.pressian.com/_resources/10/2025/11/12/2025111117101271238_l.png",
    credit: "풍천리양수발전소반대대책위 / 프레시안",
    description:
      "672차 강원생명평화기도회 및 양수발전소·송전탑 백지화 결의대회",
  },
];

const photoFields = [
  { key: "title" as const, label: "제목" },
  { key: "url" as const, label: "이미지 URL", type: "url" as const },
  { key: "credit" as const, label: "출처" },
  { key: "description" as const, label: "설명", type: "textarea" as const },
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
      aria-label={`${photo.title} 이미지 크게 보기`}
    >
      <div className="relative aspect-[4/3] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] bg-[var(--color-bg)]">
        <Image
          src={photo.url}
          alt={photo.description}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />

        {/* Gradient overlay with title and credit */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4 pt-10"
          style={{
            background:
              "linear-gradient(to top, var(--color-overlay-medium) 0%, rgba(0, 0, 0, 0.35) 55%, rgba(0, 0, 0, 0) 100%)",
          }}
        >
          <p className="text-white text-sm font-medium leading-snug">
            {photo.title}
          </p>
          <p className="text-white/70 text-xs mt-1">
            사진: {photo.credit}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function Lightbox({
  photo,
  onClose,
}: {
  photo: GalleryPhoto;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const getFocusableElements = () => {
      if (!dialogRef.current) return [];
      return Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"
        )
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !dialogRef.current?.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--color-overlay-strong)" }}
        onClick={onClose}
      >
        <motion.div
          ref={dialogRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-4xl w-full"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-lightbox-title"
          aria-describedby="gallery-lightbox-description"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-[var(--color-overlay-soft)] hover:bg-[var(--color-overlay-soft-hover)] transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6 text-[var(--color-overlay-text)]" />
          </button>
          <Image
            src={photo.url}
            alt={photo.description}
            width={1600}
            height={1200}
            className="w-full max-h-[75vh] object-contain rounded-lg"
          />
          <div className="mt-4 text-center">
            <h3 id="gallery-lightbox-title" className="text-[var(--color-overlay-text)] text-lg font-semibold break-words">
              {photo.title}
            </h3>
            <p id="gallery-lightbox-description" className="text-[var(--color-overlay-text-muted)] text-sm mt-1 break-words">{photo.description}</p>
            <p className="text-[var(--color-overlay-text-subtle)] text-xs mt-2 break-words">
              사진: {photo.credit}
            </p>
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
            <div className="max-w-5xl mx-auto mb-16 md:mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <EditableText
                  contentKey="gallery.beauty.title"
                  defaultValue="풍천리의 아름다움"
                  as="h2"
                  page="gallery"
                  section="beauty"
                  className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-3"
                />
                <EditableText
                  contentKey="gallery.beauty.description"
                  defaultValue="100년 넘은 잣나무 군락지와 멸종위기 산양이 살아가는 풍천리의 자연. 이 숲은 주민들의 삶의 터전이자, 지켜야 할 생태계의 보고입니다."
                  as="p"
                  page="gallery"
                  section="beauty"
                  className="text-[var(--color-text-muted)] text-base md:text-lg leading-relaxed max-w-2xl"
                />
              </motion.div>

              <EditableList
                contentKey="gallery.beauty.photos"
                defaultItems={defaultBeautyPhotos}
                page="gallery"
                section="beauty"
                fields={photoFields}
              >
                {(items) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {items.map((item, index) => (
                      <PhotoCard
                        key={item.id || index}
                        photo={toGalleryPhoto(item, index)}
                        index={index}
                        onOpen={openLightbox}
                      />
                    ))}
                  </div>
                )}
              </EditableList>
            </div>
          </ManagedSection>

          <ManagedSection
            page="gallery"
            sectionId="struggle"
            visibilityContentKey="gallery.struggle.visibility"
            section="struggle"
            defaultClassName="px-4"
          >
            <div className="max-w-5xl mx-auto mb-16 md:mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <EditableText
                  contentKey="gallery.struggle.title"
                  defaultValue="투쟁의 현장"
                  as="h2"
                  page="gallery"
                  section="struggle"
                  className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-3"
                />
                <EditableText
                  contentKey="gallery.struggle.description"
                  defaultValue="2019년부터 7년이 넘도록 매주 이어온 정기 집회, 680여 차의 기록. 60~80대 어르신들이 마을을 지키기 위해 걸어온 길입니다."
                  as="p"
                  page="gallery"
                  section="struggle"
                  className="text-[var(--color-text-muted)] text-base md:text-lg leading-relaxed max-w-2xl"
                />
              </motion.div>

              <EditableList
                contentKey="gallery.struggle.photos"
                defaultItems={defaultStrugglePhotos}
                page="gallery"
                section="struggle"
                fields={photoFields}
              >
                {(items) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {items.map((item, index) => (
                      <PhotoCard
                        key={item.id || index}
                        photo={toGalleryPhoto(item, index + defaultBeautyPhotos.length)}
                        index={index}
                        onOpen={openLightbox}
                      />
                    ))}
                  </div>
                )}
              </EditableList>
            </div>
          </ManagedSection>

          <ManagedSection
            page="gallery"
            sectionId="solidarity"
            visibilityContentKey="gallery.solidarity.visibility"
            section="solidarity"
            defaultClassName="px-4"
          >
            <div className="max-w-5xl mx-auto mb-16 md:mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <EditableText
                  contentKey="gallery.solidarity.title"
                  defaultValue="연대의 순간"
                  as="h2"
                  page="gallery"
                  section="solidarity"
                  className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-3"
                />
                <EditableText
                  contentKey="gallery.solidarity.description"
                  defaultValue="전국 140여 개 단체, 청소년에서 시민까지. 풍천리 주민들과 함께 손을 잡은 연대의 순간들입니다."
                  as="p"
                  page="gallery"
                  section="solidarity"
                  className="text-[var(--color-text-muted)] text-base md:text-lg leading-relaxed max-w-2xl"
                />
              </motion.div>

              <EditableList
                contentKey="gallery.solidarity.photos"
                defaultItems={defaultSolidarityPhotos}
                page="gallery"
                section="solidarity"
                fields={photoFields}
              >
                {(items) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {items.map((item, index) => (
                      <PhotoCard
                        key={item.id || index}
                        photo={toGalleryPhoto(
                          item,
                          index + defaultBeautyPhotos.length + defaultStrugglePhotos.length,
                        )}
                        index={index}
                        onOpen={openLightbox}
                      />
                    ))}
                  </div>
                )}
              </EditableList>
            </div>
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
        <Lightbox
          photo={lightboxPhoto}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
