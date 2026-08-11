"use server";

import { revalidatePath } from "next/cache";
import { requireActiveAdmin, requireEditor } from "./auth";
import { logAudit } from "./audit";
import { validateAttachmentSize } from "@/lib/attachment-limits";
import type { ActionState } from "./state";

const BUCKET = "meeting-files";

export async function uploadMeetingAttachmentAction(
  meetingId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("attachment_file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "업로드할 파일을 선택해주세요." };
  }
  const sizeCheck = validateAttachmentSize(file);
  if (!sizeCheck.ok) return { error: sizeCheck.error };

  const gate = await requireEditor();
  if ("error" in gate) return { error: gate.error };
  const supabase = gate.supabase;

  const safeName = file.name.replace(/[^\w.\-가-힣]/g, "_");
  const path = `${meetingId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
  if (uploadError) return { error: "파일 업로드에 실패했습니다. 다시 시도해주세요." };

  const { data, error } = await supabase
    .from("meeting_attachments")
    .insert({
      meeting_id: meetingId,
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    // 메타 저장 실패 시 업로드한 파일 정리
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: "첨부 정보 저장에 실패했습니다. 다시 시도해주세요." };
  }

  await logAudit(supabase, "meetings", meetingId, "update", {
    entityKey: file.name,
    payload: { attachment_added: file.name },
  });

  revalidatePath(`/admin/meetings/${meetingId}/edit`);
  return null;
}

export async function deleteMeetingAttachmentAction(
  attachmentId: number,
  meetingId: number,
): Promise<ActionState> {
  try {
    const gate = await requireEditor();
    if ("error" in gate) return { error: gate.error };
    const supabase = gate.supabase;

    const { data: row } = await supabase
      .from("meeting_attachments").select("file_path, file_name").eq("id", attachmentId).maybeSingle();

    if (row === null) {
      return { error: "첨부 파일을 찾을 수 없습니다." };
    }

    // DB 행을 먼저 지운다. 스토리지를 먼저 지우면, 뒤이은 DB 삭제가 실패했을 때
    // 목록에는 남아 있는데 실제 파일은 없는 상태(다운로드 불가)가 된다.
    const { data: deleted, error } = await supabase
      .from("meeting_attachments").delete().eq("id", attachmentId).select("id").maybeSingle();
    if (error) return { error: "첨부 삭제에 실패했습니다. 다시 시도해주세요." };
    if (!deleted) return { error: "첨부 파일을 찾을 수 없거나 권한이 없습니다." };

    if (row.file_path) {
      const { error: storageError } = await supabase.storage.from(BUCKET).remove([row.file_path]);
      // 여기서 실패하면 참조되지 않는 파일이 남을 뿐, 사용자 작업은 이미 성공했다.
      if (storageError) {
        console.error("meeting attachment storage removal failed:", row.file_path, storageError);
      }
    }

    await logAudit(supabase, "meetings", meetingId, "update", {
      entityKey: row.file_name ?? undefined,
      payload: { attachment_removed: row.file_name ?? null },
    });

    revalidatePath(`/admin/meetings/${meetingId}/edit`);
    return null;
  } catch (e) {
    console.error("deleteMeetingAttachmentAction failed:", e);
    return { error: "첨부 삭제에 실패했습니다. 다시 시도해주세요." };
  }
}

export async function getMeetingAttachmentUrl(filePath: string): Promise<string | null> {
  const gate = await requireActiveAdmin();
  if ("error" in gate) return null;
  const supabase = gate.supabase;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 60 * 60);
  if (error || !data) return null;
  return data.signedUrl;
}
