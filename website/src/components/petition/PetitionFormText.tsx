"use client";

import { EditableText } from "@/components/editable";
import type {
  PetitionEditableTextCopy,
  PetitionSignatureFormCopy,
} from "@/components/petition/petition-copy";

interface PetitionFormTextProps {
  copy: PetitionSignatureFormCopy;
  text: PetitionEditableTextCopy;
  as?: string;
  className?: string;
}

export default function PetitionFormText({
  copy,
  text,
  as = "span",
  className = "",
}: PetitionFormTextProps) {
  return (
    <EditableText
      contentKey={text.contentKey}
      defaultValue={text.defaultValue}
      as={as}
      page={copy.page}
      section="form"
      className={className}
    />
  );
}
