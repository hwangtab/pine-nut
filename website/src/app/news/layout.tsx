import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소식 — 풍천리를 지켜주세요",
  description:
    "풍천리 양수발전소 반대 투쟁의 최신 소식, 집회 일정, 언론 보도, 연대 활동을 전합니다.",
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
