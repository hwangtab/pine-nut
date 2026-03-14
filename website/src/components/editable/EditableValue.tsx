"use client";

import { useCallback, useState } from "react";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

interface EditableValueProps {
  contentKey: string;
  defaultValue: string;
  page: string;
  section?: string;
  multiline?: boolean;
  buttonLabel?: string;
  wrapperClassName?: string;
  buttonClassName?: string;
  children: (value: string, editButton: React.ReactNode) => React.ReactNode;
}

export default function EditableValue({
  contentKey,
  defaultValue,
  page,
  section,
  multiline = false,
  buttonLabel = "문구",
  wrapperClassName = "relative",
  buttonClassName = "absolute right-0 top-0 z-20 rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white shadow-lg",
  children,
}: EditableValueProps) {
  const { isEditMode, getContent, stageChange } = useAdminEdit();
  const value = getContent(contentKey) ?? defaultValue;
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleSave = useCallback(() => {
    if (localValue !== value) {
      stageChange({
        content_key: contentKey,
        content_type: "text",
        value: localValue,
        page,
        section,
      });
    }
    setEditing(false);
  }, [contentKey, localValue, page, section, stageChange, value]);

  const editButton = isEditMode ? (
    <button
      type="button"
      onClick={() => {
        setLocalValue(value);
        setEditing(true);
      }}
      className={buttonClassName}
    >
      {buttonLabel}
    </button>
  ) : null;

  return (
    <>
      <div className={wrapperClassName} data-editable-key={isEditMode ? contentKey : undefined}>
        {children(value, editButton)}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setEditing(false);
            }
          }}
        >
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-gray-900 shrink-0">문구 편집</h3>
              <span className="text-xs font-mono text-gray-400 text-right break-all min-w-0">{contentKey}</span>
            </div>
            {multiline ? (
              <textarea
                value={localValue}
                onChange={(event) => setLocalValue(event.target.value)}
                className="min-h-32 w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                autoFocus
              />
            ) : (
              <input
                value={localValue}
                onChange={(event) => setLocalValue(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                autoFocus
              />
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setLocalValue(value);
                  setEditing(false);
                }}
                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
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
