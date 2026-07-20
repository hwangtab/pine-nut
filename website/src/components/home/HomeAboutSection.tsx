"use client";

import type { RefObject } from "react";
import { EditableImage, EditableText } from "@/components/editable";
import { FadeIn } from "@/components/home/HomeMotion";
import { PineTreeIcon } from "@/components/home/HomeVisuals";

interface HomeAboutSectionProps {
  storyRef: RefObject<HTMLDivElement | null>;
}

export default function HomeAboutSection({ storyRef }: HomeAboutSectionProps) {
  return (
    <div ref={storyRef}>
      <div className="max-w-3xl mx-auto text-center">
        <FadeIn>
          <PineTreeIcon className="w-16 h-16 mx-auto mb-8 text-[var(--color-forest)]" />
        </FadeIn>

        <FadeIn delay={0.1}>
          <EditableText
            contentKey="home.about.heading"
            defaultValue="풍천리를 아시나요?"
            as="h2"
            page="home"
            section="about"
            className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 text-[var(--color-text)]"
          />
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="space-y-6 text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
            <EditableText
              contentKey="home.about.paragraph1"
              defaultValue="강원도 홍천군 화촌면, 가리산 자락에 깃든 작은 산촌 풍천리. 산림청이 '100대 명품숲'으로 꼽은 1,800ha의 국내 최대 잣나무 숲이, 마을을 병풍처럼 감싸 안고 있습니다."
              as="p"
              page="home"
              section="about"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="my-10">
            <EditableImage
              contentKey="home.about.forestImage"
              defaultSrc="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/0722/IE003499236_STD.jpg"
              alt="풍천리 잣나무 숲 실제 풍경"
              page="home"
              section="about"
              width={1200}
              height={800}
              className="w-full rounded-card border border-black/5 shadow-card"
            />
            <EditableText
              contentKey="home.about.forestPhotoCredit"
              defaultValue="사진: 오마이뉴스"
              as="p"
              page="home"
              section="about"
              className="text-xs text-[var(--color-text-muted)] mt-1"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="space-y-6 text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
            <EditableText
              contentKey="home.about.paragraph2"
              defaultValue="주민 열에 일곱이 잣을 거두어 살아가는 이곳은, 숲이 사람을 먹이고 사람이 숲을 돌보며 오랜 세월 한 호흡으로 살아온 땅입니다."
              as="p"
              page="home"
              section="about"
            />
            <EditableText
              contentKey="home.about.paragraph3"
              defaultValue="천연기념물 산양과 까막딱다구리, 수달까지. 사라져 가는 생명들이 마지막으로 기대어 사는 보금자리이기도 합니다."
              as="p"
              page="home"
              section="about"
            />
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
