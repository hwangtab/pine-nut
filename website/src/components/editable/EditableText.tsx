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
    if (newValue && newValue !== value) {
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
      data-editable-key={contentKey}
      role="textbox"
      aria-label={`편집: ${contentKey}`}
    >
      {value}
    </Tag>
  );
}
