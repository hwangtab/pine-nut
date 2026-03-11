"use client";

import { useCallback } from "react";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

interface EditableSectionProps {
  contentKey: string;
  page: string;
  section?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper that allows admins to show/hide entire sections.
 * In edit mode, hidden sections show a "restore" button.
 */
export default function EditableSection({
  contentKey,
  page,
  section,
  children,
  className = "",
}: EditableSectionProps) {
  const { isEditMode, getContent, stageChange } = useAdminEdit();
  const visibilityValue = getContent(contentKey);
  const isHidden = visibilityValue === "hidden";

  const handleToggle = useCallback(() => {
    const newValue = isHidden ? "visible" : "hidden";
    if (newValue === "hidden" && !window.confirm("이 섹션을 숨기시겠습니까?")) {
      return;
    }
    stageChange({
      content_key: contentKey,
      content_type: "section",
      value: newValue,
      page,
      section,
    });
  }, [isHidden, contentKey, page, section, stageChange]);

  // Not in edit mode and section is hidden → render nothing
  if (!isEditMode && isHidden) return null;

  // In edit mode
  if (isEditMode) {
    return (
      <div
        className="relative"
        data-editable-key={contentKey}
      >
        {/* Toggle button — always clickable */}
        <button
          type="button"
          onClick={handleToggle}
          className="absolute top-2 left-2 z-50 pointer-events-auto px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          {isHidden ? "섹션 표시" : "섹션 숨기기"}
        </button>
        <div className={`${className} ${isHidden ? "opacity-30 pointer-events-none" : ""}`}>
          {children}
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
