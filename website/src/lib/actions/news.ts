"use server";

import {
  createNews,
  deleteNews,
  restoreNews,
  restoreNewsVersion,
  updateNews,
} from "@/lib/actions/news/mutations";
import { formValues, type ActionState } from "./state";

// 실패 시 제출값을 함께 돌려준다. React 19가 폼을 자동 리셋해도 폼이 이 값으로
// 다시 그려지므로 작성 중이던 본문이 사라지지 않는다.
function withValues(state: ActionState, formData: FormData): ActionState {
  return state?.error ? { ...state, values: formValues(formData) } : state;
}

export async function createNewsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withValues(await createNews(formData), formData);
}

export async function updateNewsAction(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withValues(await updateNews(id, formData), formData);
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
