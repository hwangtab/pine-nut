import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "풍천리의 기록 — 풍천리를 지켜주세요",
  description:
    "풍천리의 아름다운 잣나무숲, 투쟁의 현장, 연대의 순간을 사진으로 기록합니다.",
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
