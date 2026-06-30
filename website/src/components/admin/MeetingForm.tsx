"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Trash2, Plus } from "lucide-react";
import type { ActionState } from "@/lib/actions/state";
import type { MeetingDetail } from "@/lib/data/meetings";
import MeetingAttachments from "@/app/admin/meetings/MeetingAttachments";

const inputCls =
  "w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-forest)]/40 focus:border-[var(--color-forest)] outline-none";
const labelCls = "block font-medium text-base text-[var(--color-admin-text)] mb-2";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "저장 중..." : label}
    </button>
  );
}

interface AttendeeRow { name: string; role: string; }
interface AgendaRow { title: string; discussion: string; }
interface DecisionRow { content: string; }
interface ActionItemRow { owner: string; task: string; due_text: string; is_done: boolean; }

interface MeetingFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initialData?: MeetingDetail;
  submitLabel: string;
  meetingId?: number;
}

export default function MeetingForm({ action, initialData, submitLabel, meetingId }: MeetingFormProps) {
  const [state, formAction] = useActionState(action, null);

  const [attendees, setAttendees] = useState<AttendeeRow[]>(
    initialData?.attendees.map((a) => ({ name: a.name, role: a.role ?? "" })) ?? [],
  );
  const [agendas, setAgendas] = useState<AgendaRow[]>(
    initialData?.agendas.map((a) => ({ title: a.title, discussion: a.discussion ?? "" })) ?? [],
  );
  const [decisions, setDecisions] = useState<DecisionRow[]>(
    initialData?.decisions.map((d) => ({ content: d.content })) ?? [],
  );
  const [actionItems, setActionItems] = useState<ActionItemRow[]>(
    initialData?.actionItems.map((it) => ({
      owner: it.owner ?? "", task: it.task, due_text: it.dueText ?? "", is_done: it.isDone,
    })) ?? [],
  );

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-8">
        {state?.error && (
          <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger)] px-4 py-3 rounded-xl text-base font-medium">
            {state.error}
          </div>
        )}

        {/* ===== 기본 정보 ===== */}
        <section className="space-y-6">
          <div>
            <label htmlFor="title" className={labelCls}>회의 제목 *</label>
            <input id="title" name="title" required defaultValue={initialData?.title} className={inputCls} placeholder="예: 풍천리 연대 음악행동 기획 회의 #2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="meeting_no" className={labelCls}>회차</label>
              <input id="meeting_no" name="meeting_no" type="number" defaultValue={initialData?.meetingNo ?? ""} className={inputCls} placeholder="예: 2" />
            </div>
            <div>
              <label htmlFor="meeting_date" className={labelCls}>날짜</label>
              <input id="meeting_date" name="meeting_date" type="date" defaultValue={initialData?.meetingDate ?? ""} className={inputCls} />
            </div>
            <div>
              <label htmlFor="meeting_time" className={labelCls}>시간/소요</label>
              <input id="meeting_time" name="meeting_time" defaultValue={initialData?.meetingTime ?? ""} className={inputCls} placeholder="예: 14:00~16:00 (약 2시간)" />
            </div>
            <div>
              <label htmlFor="location" className={labelCls}>장소</label>
              <input id="location" name="location" defaultValue={initialData?.location ?? ""} className={inputCls} placeholder="예: 온라인 화상회의" />
            </div>
            <div>
              <label htmlFor="format" className={labelCls}>형식</label>
              <select id="format" name="format" defaultValue={initialData?.format ?? ""} className={`${inputCls} bg-[var(--color-admin-surface)]`}>
                <option value="">-- 선택 --</option>
                <option value="online">온라인</option>
                <option value="offline">오프라인</option>
                <option value="hybrid">하이브리드</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className={labelCls}>상태 *</label>
              <select id="status" name="status" defaultValue={initialData?.status ?? "scheduled"} className={`${inputCls} bg-[var(--color-admin-surface)]`}>
                <option value="scheduled">예정</option>
                <option value="completed">완료</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="purpose" className={labelCls}>목적</label>
            <textarea id="purpose" name="purpose" rows={2} defaultValue={initialData?.purpose ?? ""} className={`${inputCls} resize-y`} placeholder="회의 목적" />
          </div>
          <div>
            <label htmlFor="notes" className={labelCls}>비고</label>
            <textarea id="notes" name="notes" rows={2} defaultValue={initialData?.notes ?? ""} className={`${inputCls} resize-y`} placeholder="추가 메모" />
          </div>
        </section>

        {/* ===== 참석자 ===== */}
        <DynamicSection title="참석자" onAdd={() => setAttendees((p) => [...p, { name: "", role: "" }])}>
          {attendees.map((row, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2 items-start">
              <input value={row.name} onChange={(e) => setAttendees((p) => p.map((r, j) => j === i ? { ...r, name: e.target.value } : r))} className={inputCls} placeholder="이름" />
              <input value={row.role} onChange={(e) => setAttendees((p) => p.map((r, j) => j === i ? { ...r, role: e.target.value } : r))} className={inputCls} placeholder="역할(예: 기획)" />
              <RemoveButton onClick={() => setAttendees((p) => p.filter((_, j) => j !== i))} />
            </div>
          ))}
        </DynamicSection>
        <input type="hidden" name="attendees" value={JSON.stringify(attendees)} />

        {/* ===== 안건 ===== */}
        <DynamicSection title="안건 / 논의내용" onAdd={() => setAgendas((p) => [...p, { title: "", discussion: "" }])}>
          {agendas.map((row, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-[var(--color-admin-border)] p-4">
              <div className="flex gap-2 items-start">
                <input value={row.title} onChange={(e) => setAgendas((p) => p.map((r, j) => j === i ? { ...r, title: e.target.value } : r))} className={inputCls} placeholder="안건 제목" />
                <RemoveButton onClick={() => setAgendas((p) => p.filter((_, j) => j !== i))} />
              </div>
              <textarea value={row.discussion} onChange={(e) => setAgendas((p) => p.map((r, j) => j === i ? { ...r, discussion: e.target.value } : r))} rows={4} className={`${inputCls} resize-y`} placeholder="논의내용 (마크다운)" />
            </div>
          ))}
        </DynamicSection>
        <input type="hidden" name="agendas" value={JSON.stringify(agendas)} />

        {/* ===== 결정사항 ===== */}
        <DynamicSection title="결정사항" onAdd={() => setDecisions((p) => [...p, { content: "" }])}>
          {decisions.map((row, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input value={row.content} onChange={(e) => setDecisions((p) => p.map((r, j) => j === i ? { content: e.target.value } : r))} className={inputCls} placeholder="결정 내용" />
              <RemoveButton onClick={() => setDecisions((p) => p.filter((_, j) => j !== i))} />
            </div>
          ))}
        </DynamicSection>
        <input type="hidden" name="decisions" value={JSON.stringify(decisions)} />

        {/* ===== 액션아이템 ===== */}
        <DynamicSection title="액션아이템" onAdd={() => setActionItems((p) => [...p, { owner: "", task: "", due_text: "", is_done: false }])}>
          {actionItems.map((row, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-[var(--color-admin-border)] p-4">
              <div className="flex gap-2 items-start">
                <input value={row.owner} onChange={(e) => setActionItems((p) => p.map((r, j) => j === i ? { ...r, owner: e.target.value } : r))} className={`${inputCls} sm:max-w-[160px]`} placeholder="담당" />
                <input value={row.task} onChange={(e) => setActionItems((p) => p.map((r, j) => j === i ? { ...r, task: e.target.value } : r))} className={inputCls} placeholder="할 일" />
                <RemoveButton onClick={() => setActionItems((p) => p.filter((_, j) => j !== i))} />
              </div>
              <div className="flex gap-3 items-center">
                <input value={row.due_text} onChange={(e) => setActionItems((p) => p.map((r, j) => j === i ? { ...r, due_text: e.target.value } : r))} className={`${inputCls} sm:max-w-[220px]`} placeholder="기한(예: 이번 주 내)" />
                <label className="flex items-center gap-2 text-base text-[var(--color-admin-text)]">
                  <input type="checkbox" checked={row.is_done} onChange={(e) => setActionItems((p) => p.map((r, j) => j === i ? { ...r, is_done: e.target.checked } : r))} className="w-5 h-5" />
                  완료
                </label>
              </div>
            </div>
          ))}
        </DynamicSection>
        <input type="hidden" name="action_items" value={JSON.stringify(actionItems)} />

        <div className="pt-4">
          <SubmitButton label={submitLabel} />
        </div>
      </form>

      {meetingId ? (
        <MeetingAttachments meetingId={meetingId} attachments={initialData?.attachments ?? []} />
      ) : (
        <p className="text-sm text-[var(--color-admin-muted)]">첨부파일은 회의록을 먼저 저장한 뒤 추가할 수 있습니다.</p>
      )}
    </div>
  );
}

function DynamicSection({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--color-admin-text)]">{title}</h2>
        <button type="button" onClick={onAdd} className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-[var(--color-forest)] bg-[var(--color-forest)]/10 rounded-lg hover:bg-[var(--color-forest)]/20 transition-colors">
          <Plus size={16} /> 추가
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="삭제" className="shrink-0 p-3 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-xl transition-colors">
      <Trash2 size={20} />
    </button>
  );
}
