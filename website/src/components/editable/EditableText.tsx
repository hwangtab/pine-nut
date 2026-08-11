"use client";

import { useRef, useEffect, useCallback, type ElementType } from "react";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

interface EditableTextProps {
  /** Unique content key, e.g. "home.hero.title" */
  contentKey: string;
  /** The hardcoded default value */
  defaultValue: string;
  /** HTML tag to render */
  as?: string;
  /** Page identifier for storage */
  page: string;
  /** Section identifier for storage */
  section?: string;
  /** Additional CSS classes */
  className?: string;
}

export default function EditableText({
  contentKey,
  defaultValue,
  as: tag = "span",
  page,
  section,
  className = "",
}: EditableTextProps) {
  const { isEditMode, getContent, stageChange } = useAdminEdit();
  const ref = useRef<HTMLElement | null>(null);
  const value = getContent(contentKey) ?? defaultValue;

  useEffect(() => {
    if (ref.current && !isEditMode) {
      ref.current.textContent = value;
    }
  }, [value, isEditMode]);

  const handleBlur = useCallback(() => {
    const newValue = ref.current?.textContent?.trim() ?? "";
    // 빈 값은 스테이징하지 않는다. 저장 단계에서 거부하면 배치 전체가 막히는데,
    // 정작 비워진 요소는 폭이 0이 되어 다시 클릭할 수도 없어 되돌릴 방법이 없다.
    // 여기서 화면을 원래 값으로 돌려놓는 것이 가장 확실한 차단이다.
    // (기본 문구로 되돌리려면 툴바의 '기본값 복원'을 쓴다)
    if (!newValue) {
      if (ref.current) ref.current.textContent = value;
      return;
    }
    if (newValue !== value) {
      stageChange({
        content_key: contentKey,
        content_type: "text",
        value: newValue,
        page,
        section,
      });
    }
  }, [contentKey, value, page, section, stageChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        ref.current?.blur();
      }
      if (e.key === "Escape") {
        if (ref.current) ref.current.textContent = value;
        ref.current?.blur();
      }
    },
    [value]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    ref.current?.focus();
  }, []);

  const Tag = tag as ElementType;

  if (!isEditMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag
      ref={ref}
      className={`${className} outline-none ring-2 ring-blue-400/50 ring-offset-1 rounded-sm cursor-text hover:ring-blue-500/70 focus:ring-blue-600 transition-shadow`}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      data-editable-key={contentKey}
      role="textbox"
      aria-label={`편집: ${contentKey}`}
    >
      {value}
    </Tag>
  );
}
