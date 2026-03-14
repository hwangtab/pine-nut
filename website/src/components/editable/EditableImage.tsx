"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { uploadEditableImageAction } from "@/lib/actions/page-content";
import { validateOptionalImageUrl } from "@/lib/validation/url";

interface EditableImageProps {
  contentKey: string;
  defaultSrc: string;
  alt: string;
  page: string;
  section?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  [key: string]: unknown;
}

export default function EditableImage({
  contentKey,
  defaultSrc,
  alt,
  page,
  section,
  width,
  height,
  fill,
  sizes,
  priority,
  className = "",
  ...rest
}: EditableImageProps) {
  const { isEditMode, getContent, stageChange } = useAdminEdit();
  const src = getContent(contentKey) ?? defaultSrc;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert("JPG, PNG, WebP만 업로드 가능합니다.");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadEditableImageAction(formData);
        if (result.url) {
          stageChange({
            content_key: contentKey,
            content_type: "image",
            value: result.url,
            page,
            section,
          });
        } else if (result.error) {
          alert(result.error);
        }
      } catch (err) {
        alert("이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
        console.error("[EditableImage] Upload failed:", err);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [contentKey, page, section, stageChange]
  );

  const handleUrlSubmit = useCallback(() => {
    const trimmed = urlValue.trim();
    if (!trimmed) return;

    const validation = validateOptionalImageUrl(trimmed, "이미지 URL");
    if (validation.error || !validation.value) {
      alert(validation.error ?? "이미지 URL이 올바르지 않습니다.");
      return;
    }

    stageChange({
      content_key: contentKey,
      content_type: "image",
      value: validation.value,
      page,
      section,
    });
    setShowUrlInput(false);
    setUrlValue("");
  }, [contentKey, urlValue, page, section, stageChange]);

  const imageProps = fill
    ? { fill: true as const, sizes, priority, className }
    : { width, height, sizes, priority, className };

  if (!isEditMode) {
    return <Image src={src} alt={alt} {...imageProps} {...rest} />;
  }

  return (
    <div className="relative group" data-editable-key={contentKey}>
      <Image src={src} alt={alt} {...imageProps} {...rest} />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-inherit">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {uploading ? "업로드 중..." : "파일 업로드"}
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors"
          >
            URL 입력
          </button>
        </div>
      </div>

      {/* URL input overlay */}
      {showUrlInput && (
        <div className="absolute bottom-2 left-2 right-2 z-20 flex gap-2">
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="이미지 URL 입력..."
            className="flex-1 px-3 py-2 rounded-lg text-sm bg-white text-gray-900 border-0 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUrlSubmit();
              if (e.key === "Escape") setShowUrlInput(false);
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
          >
            적용
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Edit badge */}
      <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-blue-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        이미지 편집
      </div>
    </div>
  );
}
