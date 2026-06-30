"use client";

import { useCallback, useEffect, useState } from "react";

export default function useEditableSelection(isEditMode: boolean): {
  selectedKey: string | null;
  resetSelectedKey: () => void;
} {
  const [storedSelectedKey, setStoredSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditMode) return;

    const updateSelectedKey = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const editable = target.closest<HTMLElement>("[data-editable-key]");
      const key = editable?.dataset.editableKey;
      if (key) {
        setStoredSelectedKey(key);
      }
    };

    document.addEventListener("pointerdown", updateSelectedKey, true);
    document.addEventListener("focusin", updateSelectedKey);

    return () => {
      document.removeEventListener("pointerdown", updateSelectedKey, true);
      document.removeEventListener("focusin", updateSelectedKey);
    };
  }, [isEditMode]);

  const resetSelectedKey = useCallback(() => {
    setStoredSelectedKey(null);
  }, []);

  return {
    selectedKey: isEditMode ? storedSelectedKey : null,
    resetSelectedKey,
  };
}
