"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

let globalId = 0;
function nextId() {
  return ++globalId;
}

interface EditableListItem {
  [key: string]: string;
}

interface EditableListProps<T extends EditableListItem> {
  contentKey: string;
  defaultItems: T[];
  page: string;
  section?: string;
  /** Field definitions for the edit modal */
  fields: { key: keyof T; label: string; type?: "text" | "textarea" | "url" }[];
  /** Render function for each item */
  children: (items: T[], isEditMode: boolean) => React.ReactNode;
}

export default function EditableList<T extends EditableListItem>({
  contentKey,
  defaultItems,
  page,
  section,
  fields,
  children,
}: EditableListProps<T>) {
  const { isEditMode, getContent, stageChange } = useAdminEdit();
  const [editing, setEditing] = useState(false);

  // Parse stored JSON or use defaults
  const raw = getContent(contentKey);
  let items: T[];
  try {
    items = raw ? JSON.parse(raw) : defaultItems;
  } catch {
    console.warn(`[EditableList] Failed to parse stored content for key "${contentKey}"`);
    items = defaultItems;
  }

  type ItemWithId = T & { _uid: number };

  const toKeyed = useCallback(
    (arr: T[]): ItemWithId[] => arr.map((item) => ({ ...item, _uid: nextId() })),
    []
  );

  const [localItems, setLocalItems] = useState<ItemWithId[]>(() => toKeyed(items));

  useEffect(() => {
    if (editing) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [editing]);

  const handleOpen = useCallback(() => {
    const current = getContent(contentKey);
    try {
      setLocalItems(toKeyed(current ? JSON.parse(current) : defaultItems));
    } catch {
      console.warn(`[EditableList] Failed to parse stored content for key "${contentKey}"`);
      setLocalItems(toKeyed(defaultItems));
    }
    setEditing(true);
  }, [contentKey, defaultItems, getContent, toKeyed]);

  const stripUid = useCallback(
    (arr: ItemWithId[]): T[] =>
      arr.map(({ _uid, ...rest }) => rest as unknown as T),
    []
  );

  const handleSave = useCallback(() => {
    stageChange({
      content_key: contentKey,
      content_type: "list",
      value: JSON.stringify(stripUid(localItems)),
      page,
      section,
    });
    setEditing(false);
  }, [contentKey, localItems, page, section, stageChange, stripUid]);

  const handleCancel = useCallback(() => {
    setLocalItems(toKeyed(items));
    setEditing(false);
  }, [items, toKeyed]);

  const updateItem = useCallback((index: number, key: keyof T, val: string) => {
    setLocalItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      return next;
    });
  }, []);

  const addItem = useCallback(() => {
    const empty = { _uid: nextId() } as ItemWithId;
    for (const f of fields) {
      (empty as Record<string, string>)[f.key as string] = "";
    }
    setLocalItems((prev) => [...prev, empty]);
  }, [fields]);

  const removeItem = useCallback((index: number) => {
    setLocalItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveItem = useCallback((index: number, direction: -1 | 1) => {
    setLocalItems((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }, []);

  if (!isEditMode) {
    return <>{children(items, false)}</>;
  }

  return (
    <>
      <div
        className="cursor-pointer ring-2 ring-blue-400/50 ring-offset-1 rounded-sm hover:ring-blue-500/70 transition-shadow relative group"
        onClick={handleOpen}
        data-editable-key={contentKey}
        role="button"
        aria-label={`리스트 편집: ${contentKey}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleOpen();
        }}
      >
        {children(items, true)}
        <div className="absolute top-1 right-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          리스트 편집 ({items.length}개)
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                리스트 편집 ({localItems.length}개 항목)
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                {contentKey}
              </span>
            </div>
            <div className="flex-1 p-6 overflow-auto space-y-4">
              {localItems.map((item, idx) => (
                <div
                  key={item._uid}
                  className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-500">
                      #{idx + 1}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-30 text-gray-700"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === localItems.length - 1}
                        className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-30 text-gray-700"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  {fields.map((field) => (
                    <div key={field.key as string}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={(item[field.key as string] as string) || ""}
                          onChange={(e) =>
                            updateItem(idx, field.key, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-y text-gray-900"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={field.type === "url" ? "url" : "text"}
                          value={(item[field.key as string] as string) || ""}
                          onChange={(e) =>
                            updateItem(idx, field.key, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 text-gray-900"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <button
                type="button"
                onClick={addItem}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + 항목 추가
              </button>
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
