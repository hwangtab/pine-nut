-- 게시판 신고(board_reports): 회원이 글/댓글을 신고, 기획단(editor+)이 검토
CREATE TABLE IF NOT EXISTS board_reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id BIGINT NOT NULL,
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (target_type, target_id, reporter_user_id)
);

CREATE INDEX IF NOT EXISTS idx_board_reports_status ON board_reports (status, created_at DESC);

ALTER TABLE board_reports ENABLE ROW LEVEL SECURITY;

-- 회원 본인 신고 삽입(reporter_user_id 위조 차단)
CREATE POLICY "board_reports_member_insert" ON board_reports
  FOR INSERT TO authenticated
  WITH CHECK (is_member() AND reporter_user_id = auth.uid());

-- 기획단(editor+)만 큐 열람
CREATE POLICY "board_reports_editor_read" ON board_reports
  FOR SELECT TO authenticated
  USING (admin_can_edit());

-- 기획단(editor+)만 상태 변경
CREATE POLICY "board_reports_editor_update" ON board_reports
  FOR UPDATE TO authenticated
  USING (admin_can_edit())
  WITH CHECK (admin_can_edit());
