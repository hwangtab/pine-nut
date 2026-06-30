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

for (const path of [
  "src/components/footer/FooterLink.tsx",
  "src/components/footer/FooterBrand.tsx",
  "src/components/footer/FooterQuickLinks.tsx",
  "src/components/footer/FooterContact.tsx",
  "src/components/footer/FooterBottomBar.tsx",
  "src/components/footer/FooterPrivacyPanel.tsx",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const footerSource = read("src/components/Footer.tsx");
for (const expected of [
  "FooterBrand",
  "FooterQuickLinks",
  "FooterContact",
  "FooterBottomBar",
  "FooterPrivacyPanel",
]) {
  assert(footerSource.includes(expected), `Footer must compose ${expected}.`);
}

for (const removedResponsibility of [
  "renderFooterLink",
  "EditableText",
  "EditableRichText",
  "EditableList",
  "EditableLink",
  "next/link",
  "isInternalEditableHref",
  "isExternalEditableHref",
  "privacyItems",
  "new Date()",
]) {
  assert(!footerSource.includes(removedResponsibility), `Footer should not own ${removedResponsibility}.`);
}

const footerLines = footerSource.trimEnd().split("\n").length;
assert(footerLines <= 80, `Footer should stay orchestration-focused, got ${footerLines} lines.`);

const linkSource = read("src/components/footer/FooterLink.tsx");
for (const expected of ["isInternalEditableHref", "isExternalEditableHref", "next/link"]) {
  assert(linkSource.includes(expected), `FooterLink must include ${expected}.`);
}

const quickLinksSource = read("src/components/footer/FooterQuickLinks.tsx");
for (const expected of ["FooterLink", "BuilderLinkItem", "바로가기"]) {
  assert(quickLinksSource.includes(expected), `FooterQuickLinks must include ${expected}.`);
}

const contactSource = read("src/components/footer/FooterContact.tsx");
for (const expected of ["footer.contact.phoneHref", "footer.contact.bankAccount", "footer.contact.campaignHref"]) {
  assert(contactSource.includes(expected), `FooterContact must include ${expected}.`);
}

const bottomSource = read("src/components/footer/FooterBottomBar.tsx");
for (const expected of ["new Date()", "onTogglePrivacy", "footer.bottom.englishHref"]) {
  assert(bottomSource.includes(expected), `FooterBottomBar must include ${expected}.`);
}

const privacySource = read("src/components/footer/FooterPrivacyPanel.tsx");
for (const expected of ["privacyItems", "footer.privacy.items", "footer.privacy.notice", "onClose"]) {
  assert(privacySource.includes(expected), `FooterPrivacyPanel must include ${expected}.`);
}

console.log("Footer refactor checks passed.");
