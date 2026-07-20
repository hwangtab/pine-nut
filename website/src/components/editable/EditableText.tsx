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
  /** 뷰 모드에서 *별표* 구간을 세리프 강조(.serif-accent)로 렌더 */
  accent?: boolean;
}

/* "7년, *680번*의 외침" → 680번만 <em class="serif-accent">로 감싼다.
   편집 모드에서는 별표가 그대로 보이고 그대로 저장된다. */
function renderAccent(text: string) {
  const parts = text.split(/\*([^*]+)\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="serif-accent">
        {part}
      </em>
    ) : (
      part
    )
  );
}

export default function EditableText({
  contentKey,
  defaultValue,
  as: tag = "span",
  page,
  section,
  className = "",
  accent = false,
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
    return <Tag className={className}>{accent ? renderAccent(value) : value}</Tag>;
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
