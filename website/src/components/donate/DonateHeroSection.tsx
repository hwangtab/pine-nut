"use client";

import SubHero from "@/components/SubHero";
import { EditableText } from "@/components/editable";

export default function DonateHeroSection() {
  return (
    <SubHero
      imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg"
      imageContentKey="donate.hero.image"
      imagePage="donate"
      imageSection="hero"
      title={
        <EditableText
          contentKey="donate.hero.title"
          defaultValue="후원으로 함께해주세요"
          as="span"
          page="donate"
          section="hero"
        />
      }
      subtitle={
        <EditableText
          contentKey="donate.hero.subtitle"
          defaultValue="계좌이체와 캠페인 페이지를 통해 주민들의 투쟁을 직접 도울 수 있습니다"
          as="span"
          page="donate"
          section="hero"
        />
      }
      eyebrow={
        <EditableText
          contentKey="donate.hero.eyebrow"
          defaultValue="후원 안내"
          as="span"
          page="donate"
          section="hero"
        />
      }
    />
  );
}
