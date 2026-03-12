import type { Metadata } from "next";
import StoryPageClient from "./StoryPageClient";

export const metadata: Metadata = {
  title: "풍천리 이야기 — 잣나무 숲과 마을을 지키려는 7년간의 싸움",
  description:
    "강원도 홍천군 풍천리 주민들이 양수발전소 건설에 맞서 마을과 자연을 지켜온 이야기를 전합니다.",
};

export default function StoryPage() {
  return <StoryPageClient />;
}
