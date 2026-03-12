import VersionHistoryManager from "@/components/admin/VersionHistoryManager";
import { getAuditEntries } from "@/lib/data/audit";

export default async function AdminHistoryPage() {
  const entries = await getAuditEntries(150);

  return <VersionHistoryManager entries={entries} />;
}
