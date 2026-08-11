-- 회의록 자식 레코드(참석자/안건/결정/액션아이템) 교체를 한 트랜잭션으로 묶는다.
--
-- 기존 앱 코드는 4개 테이블을 모두 DELETE한 뒤 INSERT했다. 두 단계 사이에 어떤 실패가
-- 나든(RLS 거부, 네트워크 끊김, 제약 위반) 기존 데이터가 영구 소실됐다.
-- 함수 안에서는 전체가 단일 트랜잭션이므로 어느 지점에서 실패해도 전부 롤백된다.

CREATE OR REPLACE FUNCTION public.replace_meeting_children(
  p_meeting_id BIGINT,
  p_attendees JSONB,
  p_agendas JSONB,
  p_decisions JSONB,
  p_action_items JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- SECURITY DEFINER는 RLS를 우회하므로 권한을 명시적으로 확인한다.
  IF NOT public.admin_can_edit() THEN
    RAISE EXCEPTION 'permission denied' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.meetings WHERE id = p_meeting_id) THEN
    RAISE EXCEPTION 'meeting not found' USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.meeting_attendees WHERE meeting_id = p_meeting_id;
  DELETE FROM public.meeting_agendas WHERE meeting_id = p_meeting_id;
  DELETE FROM public.meeting_decisions WHERE meeting_id = p_meeting_id;
  DELETE FROM public.meeting_action_items WHERE meeting_id = p_meeting_id;

  INSERT INTO public.meeting_attendees (meeting_id, name, role, sort_order)
  SELECT
    p_meeting_id,
    item ->> 'name',
    item ->> 'role',
    (ordinality - 1)::INT
  FROM jsonb_array_elements(COALESCE(p_attendees, '[]'::JSONB)) WITH ORDINALITY AS t(item, ordinality);

  INSERT INTO public.meeting_agendas (meeting_id, title, discussion, sort_order)
  SELECT
    p_meeting_id,
    item ->> 'title',
    item ->> 'discussion',
    (ordinality - 1)::INT
  FROM jsonb_array_elements(COALESCE(p_agendas, '[]'::JSONB)) WITH ORDINALITY AS t(item, ordinality);

  INSERT INTO public.meeting_decisions (meeting_id, content, sort_order)
  SELECT
    p_meeting_id,
    item ->> 'content',
    (ordinality - 1)::INT
  FROM jsonb_array_elements(COALESCE(p_decisions, '[]'::JSONB)) WITH ORDINALITY AS t(item, ordinality);

  INSERT INTO public.meeting_action_items (meeting_id, owner, task, due_text, is_done, sort_order)
  SELECT
    p_meeting_id,
    item ->> 'owner',
    item ->> 'task',
    item ->> 'due_text',
    COALESCE((item ->> 'is_done')::BOOLEAN, false),
    (ordinality - 1)::INT
  FROM jsonb_array_elements(COALESCE(p_action_items, '[]'::JSONB)) WITH ORDINALITY AS t(item, ordinality);
END;
$$;

REVOKE ALL ON FUNCTION public.replace_meeting_children(BIGINT, JSONB, JSONB, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_meeting_children(BIGINT, JSONB, JSONB, JSONB, JSONB) TO authenticated;
