"use server";

import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface AuthenticatedActionContext {
  supabase: SupabaseClient;
  user: User;
}

export type AuthenticatedActionClient = AuthenticatedActionContext["supabase"];

export async function getAuthenticatedActionContext(): Promise<AuthenticatedActionContext> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase not configured");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return { supabase, user };
}

export async function getAuthenticatedActionClient(): Promise<AuthenticatedActionClient> {
  const { supabase } = await getAuthenticatedActionContext();
  return supabase;
}
