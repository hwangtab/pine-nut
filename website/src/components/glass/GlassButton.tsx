import type { ComponentPropsWithoutRef } from "react";

/**
 * 액션 버튼. primary(오렌지 솔리드)는 화면의 유일한 채색 CTA,
 * glass(투명 유리)는 사진 위 보조 액션.
 */
interface GlassButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "glass";
}

export default function GlassButton({
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: GlassButtonProps) {
  return (
    <button
      type={type}
      className={`glass-btn glass-btn--${variant} ${className}`.trim()}
      {...rest}
    />
  );
}
