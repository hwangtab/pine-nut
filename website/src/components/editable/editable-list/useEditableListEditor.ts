"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import {
  createEmptyEditableListItem,
  parseEditableListItems,
  stripEditableListIds,
  withEditableListIds,
} from "./items";
import type { EditableListItem, EditableListProps } from "./types";

type UseEditableListEditorArgs<T extends EditableListItem> = Pick<
  EditableListProps<T>,
  "contentKey" | "defaultItems" | "page" | "section" | "fields"
>;

export function useEditableListEditor<T extends EditableListItem>({
  contentKey,
  defaultItems,
  page,
  section,
  fields,
}: UseEditableListEditorArgs<T>) {
  const { isEditMode, getContent, stageChange } = useAdminEdit();
  const items = parseEditableListItems(getContent(contentKey), defaultItems, contentKey);
  const [editing, setEditing] = useState(false);
  const [localItems, setLocalItems] = useState(() => withEditableListIds(items));

  useEffect(() => {
    if (editing) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [editing]);

  const handleOpen = useCallback(() => {
    const current = getContent(contentKey);
    const currentItems = parseEditableListItems(current, defaultItems, contentKey);
    setLocalItems(withEditableListIds(currentItems));
    setEditing(true);
  }, [contentKey, defaultItems, getContent]);

  const handleClose = useCallback(() => {
    setEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    const nextValue = JSON.stringify(stripEditableListIds(localItems));
    // 아무것도 바꾸지 않고 '적용'만 눌러도 스테이징하면, 하드코딩 기본값이 그대로
    // DB override로 굳어 이후 코드에서 문구를 고쳐도 화면에 반영되지 않는다.
    //
    // override가 아직 없는 리스트에서는 getContent가 undefined라 값 비교만으로는
    // 걸러지지 않는다. 그 경우 기본값 직렬화 결과와 비교해야 한다.
    const baseline = getContent(contentKey) ?? JSON.stringify(defaultItems);
    if (nextValue === baseline) {
      setEditing(false);
      return;
    }
    stageChange({
      content_key: contentKey,
      content_type: "list",
      value: nextValue,
      page,
      section,
    });
    setEditing(false);
  }, [contentKey, defaultItems, getContent, localItems, page, section, stageChange]);

  const handleCancel = useCallback(() => {
    setLocalItems(withEditableListIds(items));
    setEditing(false);
  }, [items]);

  const updateItem = useCallback((index: number, key: keyof T, value: string) => {
    setLocalItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }, []);

  const addItem = useCallback(() => {
    setLocalItems((prev) => [...prev, createEmptyEditableListItem(fields)]);
  }, [fields]);

  const removeItem = useCallback((index: number) => {
    setLocalItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
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

  return {
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
  };
}
