"use client";

import { EditableListModal } from "./editable-list/EditableListModal";
import type { EditableListItem, EditableListProps } from "./editable-list/types";
import { useEditableListEditor } from "./editable-list/useEditableListEditor";

export default function EditableList<T extends EditableListItem>({
  contentKey,
  defaultItems,
  page,
  section,
  fields,
  children,
}: EditableListProps<T>) {
  const {
    isEditMode,
    items,
    editing,
    localItems,
    handleOpen,
    handleClose,
    handleSave,
    handleCancel,
    updateItem,
    addItem,
    removeItem,
    moveItem,
  } = useEditableListEditor({ contentKey, defaultItems, page, section, fields });

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
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") handleOpen();
        }}
      >
        {children(items, true)}
        <div className="absolute top-1 right-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          리스트 편집 ({items.length}개)
        </div>
      </div>

      {editing && (
        <EditableListModal
          contentKey={contentKey}
          fields={fields}
          localItems={localItems}
          onClose={handleClose}
          onCancel={handleCancel}
          onSave={handleSave}
          onUpdateItem={updateItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onMoveItem={moveItem}
        />
      )}
    </>
  );
}
