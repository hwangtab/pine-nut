"use client";

import { EditableValue } from "@/components/editable";
import type {
  PetitionEditableValueCopy,
  PetitionSignatureFormCopy,
} from "@/components/petition/petition-copy";

interface PetitionFormEditControlsProps {
  copy: PetitionSignatureFormCopy;
  fields: PetitionEditableValueCopy[];
}

function EditControl({
  copy,
  field,
}: {
  copy: PetitionSignatureFormCopy;
  field: PetitionEditableValueCopy;
}) {
  return (
    <EditableValue
      contentKey={field.contentKey}
      defaultValue={field.defaultValue}
      page={copy.page}
      section="form"
      multiline={field.multiline}
      buttonLabel={field.buttonLabel}
      wrapperClassName="relative"
      buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
    >
      {(value, editButton) => editButton ?? <span>{value}</span>}
    </EditableValue>
  );
}

export default function PetitionFormEditControls({
  copy,
  fields,
}: PetitionFormEditControlsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {fields.map((field) => (
        <EditControl key={field.contentKey} copy={copy} field={field} />
      ))}
    </div>
  );
}
