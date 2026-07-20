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
            defaultValue="*풍천리*를 아시나요?"
            as="h2"
            page="home"
            section="about"
            accent
            className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 text-[var(--color-text)]"
          />
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="space-y-6 text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
            <EditableText
              contentKey="home.about.paragraph1"
              defaultValue="강원도 홍천군 화촌면에 위치한 작은 마을, 풍천리. 산림청 지정 '100대 명품숲', 1,800ha 규모 국내 최대 잣나무 숲에 둘러싸인 가리산 자락의 산촌입니다."
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
              defaultValue="주민 약 70%가 잣 생산으로 생계를 유지하는 이 마을은, 숲과 사람이 함께 숨 쉬는 곳입니다."
              as="p"
              page="home"
              section="about"
            />
            <EditableText
              contentKey="home.about.paragraph3"
              defaultValue="이 숲에는 산양(천연기념물), 까막딱다구리, 수달 등 멸종위기종이 서식하고 있습니다."
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
