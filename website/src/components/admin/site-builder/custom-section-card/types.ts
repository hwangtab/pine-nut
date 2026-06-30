import type { CustomSection } from "@/lib/custom-sections";

export type UpdateCustomSection = <Key extends keyof CustomSection>(
  field: Key,
  value: CustomSection[Key],
) => void;
