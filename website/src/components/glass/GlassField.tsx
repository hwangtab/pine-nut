import type { ComponentPropsWithoutRef } from "react";
import { useId } from "react";

/**
 * frost 표면 안에 놓는 라벨 + 입력 필드 한 쌍.
 * 서명 폼·로그인·게시판 글쓰기 등 "읽는 유리" 위 입력에 사용.
 */
interface GlassFieldProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  id?: string;
}

export default function GlassField({ label, id, className = "", ...rest }: GlassFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label
        htmlFor={fieldId}
        className="text-[12.5px] font-bold tracking-[0.04em] text-[var(--frost-muted)]"
      >
        {label}
      </label>
      <input id={fieldId} className={`frost-field ${className}`.trim()} {...rest} />
    </div>
  );
}
