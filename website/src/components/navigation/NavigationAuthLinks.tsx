"use client";

import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";

interface NavigationAuthLinksProps {
  isActiveAdmin: boolean;
  isLoggedIn: boolean;
  variant?: "desktop" | "mobile";
  isTransparent?: boolean;
}

export default function NavigationAuthLinks({
  isActiveAdmin,
  isLoggedIn,
  variant = "desktop",
  isTransparent = false,
}: NavigationAuthLinksProps) {
  const isMobile = variant === "mobile";
  // 투명 헤더(히어로 위)에서는 어두운 텍스트가 배경에 묻히므로 흰색 계열로 전환
  const onDark = isTransparent && !isMobile;
  const mutedColor = onDark
    ? "text-white/80 hover:text-white hover:bg-white/10"
    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]";

  const linkClassName = isMobile
    ? `px-4 py-3 rounded-xl text-lg font-medium min-h-[48px] flex items-center transition-colors ${mutedColor}`
    : `px-4 py-2 rounded-lg text-[15px] font-medium min-h-[44px] flex items-center transition-colors duration-300 ${mutedColor}`;

  // 색 다이어트: warm "함께하기"만 유일한 솔리드 CTA. 회원가입은 아웃라인으로 강등
  const signupClassName = isMobile
    ? "px-4 py-3 rounded-xl text-lg font-bold min-h-[48px] flex items-center justify-center transition-colors text-white bg-[var(--color-forest)] hover:opacity-90"
    : onDark
      ? "px-4 py-2 rounded-full text-[15px] font-bold min-h-[44px] flex items-center transition-colors text-white border border-white/55 hover:bg-white/15"
      : "px-4 py-2 rounded-full text-[15px] font-bold min-h-[44px] flex items-center transition-colors text-[var(--color-forest)] border border-[var(--color-forest)]/45 hover:bg-[var(--color-forest)]/10";

  const buttonClassName = isMobile
    ? `px-4 py-3 rounded-xl text-lg font-medium min-h-[48px] flex items-center transition-colors text-left ${mutedColor}`
    : `px-4 py-2 rounded-lg text-[15px] font-medium min-h-[44px] flex items-center transition-colors duration-300 ${mutedColor}`;

  const containerClassName = isMobile
    ? "flex flex-col gap-1 mt-3 pt-3 border-t border-[var(--color-border)]"
    : `flex items-center gap-1 ml-3 pl-3 border-l ${
        onDark ? "border-white/30" : "border-[var(--color-border)]"
      }`;

  if (!isLoggedIn) {
    return (
      <div className={containerClassName}>
        <Link href="/login" className={linkClassName}>
          로그인
        </Link>
        <Link href="/signup" className={signupClassName}>
          회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {isActiveAdmin && (
        <Link href="/admin" className={linkClassName}>
          관리자
        </Link>
      )}
      <LogoutButton className={buttonClassName} />
    </div>
  );
}
