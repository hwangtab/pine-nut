import { existsSync, readFileSync } from "node:fs";
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

const mainPath = "src/components/admin/MediaLibraryManager.tsx";
const modulePaths = [
  "src/components/admin/media/useMediaLibraryManager.ts",
  "src/components/admin/media/MediaLibraryIntro.tsx",
  "src/components/admin/media/MediaLibraryStatus.tsx",
  "src/components/admin/media/MediaUploadPanel.tsx",
  "src/components/admin/media/MediaLibraryGrid.tsx",
  "src/components/admin/media/MediaLibraryCard.tsx",
];

for (const modulePath of modulePaths) {
  assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
}

const mainSource = read(mainPath);
assert(
  mainSource.trim().split(/\r?\n/).length <= 70,
  "MediaLibraryManager.tsx must stay a small orchestration component.",
);

for (const required of [
  "useMediaLibraryManager",
  "MediaLibraryIntro",
  "MediaLibraryStatus",
  "MediaUploadPanel",
  "MediaLibraryGrid",
]) {
  assert(mainSource.includes(required), `MediaLibraryManager.tsx must include ${required}.`);
}

for (const banned of [
  "useState",
  "useTransition",
  "useRef",
  "Image",
  "uploadMediaLibraryAction",
  "deleteMediaLibraryItemAction",
  "navigator.clipboard",
  "window.confirm",
]) {
  assert(!mainSource.includes(banned), `MediaLibraryManager.tsx must not own ${banned}.`);
}

const hookSource = read("src/components/admin/media/useMediaLibraryManager.ts");
const mediaActionSource = read("src/lib/actions/media-library.ts");
const hardeningMigrationSource = read("supabase/migrations/20260701000001_admin_role_security_hardening.sql");
for (const required of [
  "useTransition",
  "uploadMediaLibraryAction",
  "deleteMediaLibraryItemAction",
  "handleUpload",
  "handleDelete",
  "handleCopyUrl",
  "fileInputRef",
  "navigator.clipboard",
]) {
  assert(hookSource.includes(required), `useMediaLibraryManager.ts must contain ${required}.`);
}

const uploadSource = read("src/components/admin/media/MediaUploadPanel.tsx");
for (const required of [
  'value={folder}',
  'accept="image/jpeg,image/png,image/webp"',
  "handleUpload",
  "setFolder",
]) {
  assert(uploadSource.includes(required), `MediaUploadPanel.tsx must contain ${required}.`);
}

const cardSource = read("src/components/admin/media/MediaLibraryCard.tsx");
for (const required of [
  "Image",
  "handleCopyUrl",
  "handleDelete",
  "updatedAt",
]) {
  assert(cardSource.includes(required), `MediaLibraryCard.tsx must contain ${required}.`);
}

assert(
  mediaActionSource.includes('supabase.storage.from("images").remove([path])'),
  "media library delete action must remove images from storage.",
);
assert(
  hardeningMigrationSource.includes('CREATE POLICY "images_editor_delete"') &&
    hardeningMigrationSource.includes("bucket_id = 'images' AND admin_can_edit()"),
  "images storage delete must have an editor+ RLS policy.",
);

console.log("Media library refactor checks passed.");
