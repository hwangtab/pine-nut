import type {
  EditableListField,
  EditableListItem,
  EditableListItemWithId,
} from "./types";

let globalId = 0;

function nextEditableListId() {
  return ++globalId;
}

export function parseEditableListItems<T extends EditableListItem>(
  raw: string | undefined,
  defaultItems: T[],
  contentKey: string,
): T[] {
  try {
    return raw ? JSON.parse(raw) : defaultItems;
  } catch {
    console.warn(`[EditableList] Failed to parse stored content for key "${contentKey}"`);
    return defaultItems;
  }
}

export function withEditableListIds<T extends EditableListItem>(
  items: T[],
): EditableListItemWithId<T>[] {
  return items.map((item) => ({ ...item, _uid: nextEditableListId() }));
}

export function stripEditableListIds<T extends EditableListItem>(
  items: EditableListItemWithId<T>[],
): T[] {
  return items.map((item) => {
    const rest = { ...item };
    delete (rest as Partial<EditableListItemWithId<T>>)._uid;
    return rest as unknown as T;
  });
}

export function createEmptyEditableListItem<T extends EditableListItem>(
  fields: EditableListField<T>[],
): EditableListItemWithId<T> {
  const empty = { _uid: nextEditableListId() } as EditableListItemWithId<T>;

  for (const field of fields) {
    (empty as Record<string, string>)[field.key as string] = "";
  }

  return empty;
}
