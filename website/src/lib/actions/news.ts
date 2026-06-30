"use server";

import {
  createNews,
  deleteNews,
  restoreNews,
  restoreNewsVersion,
  updateNews,
} from "@/lib/actions/news/mutations";
import type { ActionState } from "./state";

export async function createNewsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return createNews(formData);
}

export async function updateNewsAction(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return updateNews(id, formData);
}

export async function deleteNewsAction(id: number): Promise<ActionState> {
  return deleteNews(id);
}

export async function restoreNewsAction(id: number): Promise<ActionState> {
  return restoreNews(id);
}

export async function restoreNewsVersionAction(
  payload: Record<string, unknown> | null | undefined,
): Promise<ActionState> {
  return restoreNewsVersion(payload);
}
