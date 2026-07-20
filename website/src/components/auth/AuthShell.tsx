import type { ReactNode } from "react";
import Image from "next/image";

/**
 * 로그인·회원가입 공용 셸. 숲 사진 위에 읽는 유리(frost) 카드를 띄운다.
 * frost 재질이 제대로 빛나는 자리 — 사진 위, 어두운 잉크로 가독성 보장.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-28">
      <Image
        src="/images/forest-aerial.jpg"
        alt=""
        role="presentation"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 20% 10%, rgba(74,122,46,.28), transparent 55%), linear-gradient(180deg, rgba(12,20,18,.7), rgba(9,16,15,.82))",
        }}
        aria-hidden="true"
      />
      <div className="relative z-[1] w-full max-w-md">
        <div className="frost rounded-[var(--radius-panel)] p-8 md:p-10">
          <div className="relative z-[1]">
            <h1 className="mb-2 text-center text-2xl font-black text-[var(--frost-ink)]">
              {title}
            </h1>
            {subtitle && (
              <p className="mb-8 text-center text-sm leading-relaxed text-[var(--frost-muted)]">
                {subtitle}
              </p>
            )}
            {children}
            {footer && (
              <div className="mt-6 text-center text-sm text-[var(--frost-muted)]">{footer}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
