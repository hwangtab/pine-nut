"use client";

import { useCallback, useState, useEffect } from "react";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

interface EditableRichTextProps {
  contentKey: string;
  defaultValue: string;
  page: string;
  section?: string;
  className?: string;
  renderMode?: "paragraphs" | "paragraph" | "lines";
  /** Render function for display mode */
  children?: (value: string) => React.ReactNode;
}

/**
 * Editable rich text component.
 * In display mode, renders via children render prop or as paragraphs.
 * In edit mode, shows a textarea modal for editing longer text.
 */
export default function EditableRichText({
  contentKey,
  defaultValue,
  page,
  section,
  className = "",
  renderMode = "paragraphs",
  children,
}: EditableRichTextProps) {
  const { isEditMode, getContent, stageChange } = useAdminEdit();
  const value = getContent(contentKey) ?? defaultValue;
  const [editing, setEditing] = useState(false);
  const [localState, setLocalState] = useState({ value: value, localValue: value });

  // Sync localValue when the external value changes (outside of editing)
  // Using derived state pattern to avoid useEffect + setState
  if (!editing && localState.value !== value) {
    setLocalState({ value, localValue: value });
  }

  const localValue = localState.localValue;
  const setLocalValue = useCallback(
    (v: string | ((prev: string) => string)) => {
      setLocalState((prev) => ({
        ...prev,
        localValue: typeof v === "function" ? v(prev.localValue) : v,
      }));
    },
    []
  );

  useEffect(() => {
    if (editing) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [editing]);

  const handleOpen = useCallback(() => {
    setLocalValue(value);
    setEditing(true);
  }, [value, setLocalValue]);

  const handleSave = useCallback(() => {
    const trimmed = localValue.trim();
    if (trimmed && trimmed !== value) {
      stageChange({
        content_key: contentKey,
        content_type: "richtext",
        value: trimmed,
        page,
        section,
      });
    }
    setEditing(false);
  }, [contentKey, localValue, value, page, section, stageChange]);

  const handleCancel = useCallback(() => {
    setLocalValue(value);
    setEditing(false);
  }, [value, setLocalValue]);

  const renderValue = useCallback(
    (nextValue: string) => {
      if (children) return children(nextValue);

      if (renderMode === "paragraph") {
        return <p className={className}>{nextValue}</p>;
      }

      if (renderMode === "lines") {
        return (
          <p className={className}>
            {nextValue.split("\n").map((line, index) => (
              <span key={index}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        );
      }

      return (
        <div className={className}>
          {nextValue.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      );
    },
    [children, className, renderMode]
  );

  // Display mode
  if (!isEditMode) {
    return <>{renderValue(value)}</>;
  }

  return (
    <>
      {/* Clickable container */}
      <div
        className={`${className} cursor-pointer ring-2 ring-blue-400/50 ring-offset-1 rounded-sm hover:ring-blue-500/70 transition-shadow relative group`}
        onClick={handleOpen}
        data-editable-key={contentKey}
        role="button"
        aria-label={`편집: ${contentKey}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleOpen();
        }}
      >
        {renderValue(value)}
        <div className="absolute top-1 right-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          클릭하여 편집
        </div>
      </div>

      {/* Modal editor */}
      {editing && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">텍스트 편집</h3>
              <span className="text-xs text-gray-400 font-mono">
                {contentKey}
              </span>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <textarea
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg text-base leading-relaxed resize-y outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
