"use client";

import { useState } from "react";
import { validateImageFile } from "@/lib/image-upload-limits";
import {
  adminFileInputClassName,
  adminNoticeTextClassName,
  type AdminFormVariant,
} from "./styles";

interface AdminImageFileFieldProps {
  id?: string;
  name?: string;
  label: string;
  variant: AdminFormVariant;
  helperText: string;
  currentImageAlt?: string;
  currentImageUrl?: string;
  currentNotice?: string;
  /**
   * 서버 검증이 실패해 폼이 되돌아온 상태인지.
   * React 19는 액션 호출 시 폼을 리셋하는데 file input은 값을 복원할 수 없다
   * (보안상 스크립트로 파일을 다시 채워 넣지 못한다). 사용자가 이를 모르고
   * 다시 저장하면 사진 없이 저장되므로, 그 사실을 명시적으로 알린다.
   */
  submitFailed?: boolean;
}

export default function AdminImageFileField({
  id = "image_file",
  name = "image_file",
  label,
  variant,
  helperText,
  currentImageAlt = "현재 이미지",
  currentImageUrl,
  currentNotice,
  submitFailed = false,
}: AdminImageFileFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setError(null);
      setPicked(null);
      return;
    }
    const result = validateImageFile(file);
    if (!result.ok) {
      // 서버까지 보내지 않고 즉시 안내 + 선택 취소(용량 초과/형식 오류를 바로 알림)
      alert(result.error);
      setError(result.error);
      setPicked(null);
      e.target.value = "";
      return;
    }
    setError(null);
    setPicked(file.name);
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-base font-medium text-[var(--color-admin-text)]"
      >
        {label}
      </label>
      {(currentImageUrl || currentNotice) && (
        <div className="mb-3">
          {currentImageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImageUrl}
                alt={currentImageAlt}
                className="h-20 w-32 rounded-lg border border-[var(--color-admin-border)] object-cover"
              />
            </>
          )}
          {currentNotice && (
            <p className={`mt-1.5 text-sm ${adminNoticeTextClassName(variant)}`}>
              {currentNotice}
            </p>
          )}
        </div>
      )}
      <input
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className={adminFileInputClassName(variant)}
      />
      {submitFailed && picked && (
        <p className="mt-1.5 text-sm font-semibold text-[var(--color-danger)]">
          저장에 실패해 선택했던 사진(&lsquo;{picked}&rsquo;)이 해제됐습니다. 사진을 다시 골라주세요.
        </p>
      )}
      {error ? (
        <p className="mt-1.5 text-sm font-semibold text-[var(--color-danger)]">
          {error}
        </p>
      ) : (
        <p className="mt-1.5 text-sm text-[var(--color-admin-muted)]">
          {helperText}
        </p>
      )}
    </div>
  );
}
