export type AdminRole = "owner" | "editor" | "viewer";

export const ROLE_RANK: Record<AdminRole, number> = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

export function isAdminRole(role: unknown): role is AdminRole {
  return role === "owner" || role === "editor" || role === "viewer";
}
