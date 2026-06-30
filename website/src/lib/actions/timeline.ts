"use server";

import {
  createTimeline,
  deleteTimeline,
  restoreTimeline,
  restoreTimelineVersion,
  updateTimeline,
} from "@/lib/actions/timeline/mutations";
import type { ActionState } from "./state";

export async function createTimelineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return createTimeline(formData);
}

export async function updateTimelineAction(
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return updateTimeline(id, formData);
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
