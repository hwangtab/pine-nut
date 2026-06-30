import type { MouseEvent } from "react";
import type {
  EditableListField,
  EditableListItem,
  EditableListItemWithId,
} from "./types";

interface EditableListModalProps<T extends EditableListItem> {
  contentKey: string;
  fields: EditableListField<T>[];
  localItems: EditableListItemWithId<T>[];
  onClose: () => void;
  onCancel: () => void;
  onSave: () => void;
  onUpdateItem: (index: number, key: keyof T, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onMoveItem: (index: number, direction: -1 | 1) => void;
}

export function EditableListModal<T extends EditableListItem>({
  contentKey,
  fields,
  localItems,
  onClose,
  onCancel,
  onSave,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onMoveItem,
}: EditableListModalProps<T>) {
  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between gap-2 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 shrink-0">
            리스트 편집 ({localItems.length}개 항목)
          </h3>
          <span className="text-xs text-gray-400 font-mono text-right break-all min-w-0">
            {contentKey}
          </span>
        </div>
        <div className="flex-1 p-6 overflow-auto space-y-4">
          {localItems.map((item, index) => (
            <div
              key={item._uid}
              className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveItem(index, -1)}
                    disabled={index === 0}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-30 text-gray-700"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveItem(index, 1)}
                    disabled={index === localItems.length - 1}
                    className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-30 text-gray-700"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(index)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    삭제
                  </button>
                </div>
              </div>
              {fields.map((field) => {
                const fieldKey = field.key as string;
                return (
                  <div key={fieldKey}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={(item[fieldKey] as string) || ""}
                        onChange={(event) =>
                          onUpdateItem(index, field.key, event.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-y text-gray-900"
                        rows={3}
                      />
                    ) : (
                      <input
                        type={field.type === "url" ? "url" : "text"}
                        value={(item[fieldKey] as string) || ""}
                        onChange={(event) =>
                          onUpdateItem(index, field.key, event.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 text-gray-900"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          <button
            type="button"
            onClick={onAddItem}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            + 항목 추가
          </button>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
