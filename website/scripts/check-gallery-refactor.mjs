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

const dataSource = read("src/components/gallery/gallery-data.ts");
for (const exportName of [
  "englishBeautyPhotos",
  "englishStrugglePhotos",
  "englishSolidarityPhotos",
  "englishPhotoFields",
]) {
  assert(dataSource.includes(exportName), `gallery-data.ts must export ${exportName}.`);
}

const sectionSource = read("src/components/gallery/GalleryPhotoSection.tsx");
for (const expected of [
  "page = \"gallery\"",
  "fields = photoFields",
  "creditLabel = \"사진:\"",
  "openAriaLabel",
]) {
  assert(
    sectionSource.includes(expected),
    `GalleryPhotoSection must support locale override: missing ${expected}.`,
  );
}

const cardSource = read("src/components/gallery/GalleryPhotoCard.tsx");
assert(
  cardSource.includes("creditLabel?: string"),
  "GalleryPhotoCard must accept a localized credit label.",
);
assert(
  cardSource.includes("openAriaLabel?:"),
  "GalleryPhotoCard must accept localized open aria text.",
);

const lightboxSource = read("src/components/gallery/GalleryLightbox.tsx");
assert(
  lightboxSource.includes("closeLabel = \"닫기\""),
  "GalleryLightbox must keep a Korean default close label while allowing override.",
);
assert(
  lightboxSource.includes("creditLabel = \"사진:\""),
  "GalleryLightbox must allow localized credit labels.",
);

const englishPage = read("src/app/en/gallery/page.tsx");
for (const required of [
  "GalleryPhotoSection",
  "GalleryLightbox",
  "englishBeautyPhotos",
  "englishStrugglePhotos",
  "englishSolidarityPhotos",
  "englishPhotoFields",
]) {
  assert(englishPage.includes(required), `/en/gallery must use shared ${required}.`);
}

for (const banned of [
  "function PhotoCard",
  "function Lightbox",
  "function GallerySection",
  "const beautyPhotos",
  "const strugglePhotos",
  "const solidarityPhotos",
  "const photoFields",
  "function toGalleryPhoto",
]) {
  assert(!englishPage.includes(banned), `/en/gallery must not duplicate ${banned}.`);
}

console.log("Gallery refactor checks passed.");
