"use server";

import {
  createMeeting,
  deleteMeeting,
  restoreMeeting,
  updateMeeting,
} from "@/lib/actions/meetings/mutations";
import { formValues, type ActionState } from "./state";

// 실패 시 제출값을 함께 돌려준다(React 19 폼 자동 리셋 대비). news.ts와 동일한 이유.
function withValues(state: ActionState, formData: FormData): ActionState {
  return state?.error ? { ...state, values: formValues(formData) } : state;
}

export async function createMeetingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withValues(await createMeeting(formData), formData);
}

export async function updateMeetingAction(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return withValues(await updateMeeting(id, formData), formData);
}

export async function deleteMeetingAction(id: number): Promise<ActionState> {
  return deleteMeeting(id);
}

export async function restoreMeetingAction(id: number): Promise<ActionState> {
  return restoreMeeting(id);
}
