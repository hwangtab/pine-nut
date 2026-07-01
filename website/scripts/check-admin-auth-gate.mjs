import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

const proxySource = read("src/proxy.ts");
assert(
  proxySource.includes('supabase.rpc("is_active_admin")'),
  "admin proxy must verify active admin membership, not only login state.",
);
assert(
  proxySource.includes("adminCheckError ? false"),
  "admin proxy must fail closed when active-admin RPC cannot be checked.",
);
assert(
  proxySource.includes("isAdminPublicPage") &&
    proxySource.includes("canAccessAdmin") &&
    proxySource.includes(": response"),
  "admin login/signup must stay reachable for non-admin or unclaimed users.",
);
assert(
  proxySource.includes('NextResponse.redirect(new URL("/admin/login", request.url))'),
  "non-active users must be redirected away from protected admin pages.",
);

console.log("Admin auth gate checks passed.");
