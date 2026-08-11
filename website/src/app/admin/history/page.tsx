import VersionHistoryManager from "@/components/admin/VersionHistoryManager";
import { getAuditEntriesForHistory } from "@/lib/data/audit";

export default async function AdminHistoryPage() {
  // 테이블별로 각각 최신 기록을 읽어 합친다. 전체 최신 N건만 읽으면 기록이 잦은
  // page_content가 소식·타임라인의 복원 지점을 화면 밖으로 밀어낸다.
  const entries = await getAuditEntriesForHistory();

  return <VersionHistoryManager entries={entries} />;
}
