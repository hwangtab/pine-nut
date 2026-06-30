"use server";

import {
  createMeeting,
  deleteMeeting,
  restoreMeeting,
  updateMeeting,
} from "@/lib/actions/meetings/mutations";
import type { ActionState } from "./state";

export async function createMeetingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return createMeeting(formData);
}

export async function updateMeetingAction(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return updateMeeting(id, formData);
}

export async function deleteMeetingAction(id: number): Promise<ActionState> {
  return deleteMeeting(id);
}

export async function restoreMeetingAction(id: number): Promise<ActionState> {
  return restoreMeeting(id);
}
