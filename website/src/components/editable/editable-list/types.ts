import type { ReactNode } from "react";

export interface EditableListItem {
  [key: string]: string;
}

export interface EditableListField<T extends EditableListItem> {
  key: keyof T;
  label: string;
  type?: "text" | "textarea" | "url";
}

export type EditableListItemWithId<T extends EditableListItem> = T & { _uid: number };

export interface EditableListProps<T extends EditableListItem> {
  contentKey: string;
  defaultItems: T[];
  page: string;
  section?: string;
  fields: EditableListField<T>[];
  children: (items: T[], isEditMode: boolean) => ReactNode;
}
