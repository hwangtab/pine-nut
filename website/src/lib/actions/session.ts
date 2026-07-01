"use server";

import { getMyAdminMember } from "@/lib/data/admin-members";

export async function getLandingPath(): Promise<string> {
  const me = await getMyAdminMember();
  return me ? "/admin" : "/mypage";
}
