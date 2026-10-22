"use client";

import { useState } from "react";
import type { PageContent } from "@/lib/data/page-content";

/**
 * 서버에서 내려온 page_content를 클라이언트 상태로 들고 있는다.
 *
 * 프로바이더는 루트 레이아웃에 있어 다시 마운트되지 않는다. useState(initialContent)만
 * 쓰면 /admin/history 복원이나 사이트 빌더 저장 뒤 서버가 새 값을 내려줘도 첫 값에
 * 머물러, 공개 페이지에 낡은 문구·섹션 순서가 보이고 다음 편집의 base_value가 낡아
 * "다른 관리자가 먼저 저장" 충돌이 거짓으로 난다.
 * 그래서 prop 참조가 바뀌면 렌더 중에 상태를 맞춘다(React 권장 패턴 — effect 불필요).
 * 스테이징된 변경은 별도 상태라 그대로 남는다.
 */
export default function useDbContent(
  initialContent: Record<string, PageContent>,
) {
  const [dbContent, setDbContent] = useState(initialContent);
  const [syncedFrom, setSyncedFrom] = useState(initialContent);

  if (syncedFrom !== initialContent) {
    setSyncedFrom(initialContent);
    setDbContent(initialContent);
  }

  return [dbContent, setDbContent] as const;
}
