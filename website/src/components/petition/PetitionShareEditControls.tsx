"use client";

import { EditableValue } from "@/components/editable";
import {
  koreanPetitionShareEditFields,
  type PetitionShareEditField,
} from "@/components/petition/petition-copy";

export default function PetitionShareEditControls({
  fields = koreanPetitionShareEditFields,
}: {
  fields?: PetitionShareEditField[];
}) {
  return (
    <div className="fixed bottom-20 sm:bottom-4 left-2 right-2 sm:left-4 sm:right-auto z-40 flex flex-wrap gap-2 rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-xl backdrop-blur max-w-sm sm:max-w-none">
      {fields.map((field) => (
        <EditableValue
          key={field.contentKey}
          contentKey={field.contentKey}
          defaultValue={field.defaultValue}
          page={field.page}
          section={field.section}
          multiline={field.multiline}
          buttonLabel={field.buttonLabel}
          wrapperClassName="relative"
          buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
        >
          {(value, editButton) => editButton ?? <span>{value}</span>}
        </EditableValue>
      ))}
    </div>
  );
}
