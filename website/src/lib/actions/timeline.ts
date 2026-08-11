"use server";

import {
  createTimeline,
  deleteTimeline,
  restoreTimeline,
  restoreTimelineVersion,
  updateTimeline,
} from "@/lib/actions/timeline/mutations";
import { formValues, type ActionState } from "./state";

// 실패 시 제출값을 함께 돌려준다(React 19 폼 자동 리셋 대비). news.ts와 동일한 이유.
function withValues(state: ActionState, formData: FormData): ActionState {
  return state?.error ? { ...state, values: formValues(formData) } : state;
}

export async function createTimelineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withValues(await createTimeline(formData), formData);
}

export async function updateTimelineAction(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withValues(await updateTimeline(id, formData), formData);
}

export async function deleteTimelineAction(id: number): Promise<ActionState> {
  return deleteTimeline(id);
}

export async function restoreTimelineAction(id: number): Promise<ActionState> {
  return restoreTimeline(id);
}

export async function restoreTimelineVersionAction(
  payload: Record<string, unknown> | null | undefined,
): Promise<ActionState> {
  return restoreTimelineVersion(payload);
}
