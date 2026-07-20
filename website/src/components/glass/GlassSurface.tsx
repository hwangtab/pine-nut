import type { ComponentPropsWithoutRef, ElementType } from "react";

/**
 * 리퀴드 글래스 표면 프리미티브.
 * 컴포넌트는 tier만 고르고, 재질 값(블러·틴트·엣지)은 globals.css가 소유한다.
 *
 * - glass   : 보는 유리(표준) — 카드·토스트·내비
 * - strong  : 보는 유리(강)  — 히어로 패널·모달
 * - subtle  : 보는 유리(약)  — 얇은 바·오버레이
 * - frost   : 읽는 유리       — 본문·폼(어두운 잉크, 가독성 보장)
 * - dark    : 다크 틴트       — 사진 위 소형 요소(흰 잉크 보장)
 */
export type GlassTier = "glass" | "strong" | "subtle" | "frost" | "dark";

const TIER_CLASS: Record<GlassTier, string> = {
  glass: "glass",
  strong: "glass-strong",
  subtle: "glass-subtle",
  frost: "frost",
  dark: "glass-dark",
};

type GlassSurfaceProps<T extends ElementType> = {
  tier?: GlassTier;
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export default function GlassSurface<T extends ElementType = "div">({
  tier = "glass",
  as,
  className = "",
  ...rest
}: GlassSurfaceProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return <Tag className={`${TIER_CLASS[tier]} ${className}`.trim()} {...rest} />;
}
