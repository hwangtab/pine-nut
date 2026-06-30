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
  "src/components/donate/DonateToast.tsx",
  "src/components/donate/DonateHeroSection.tsx",
  "src/components/donate/DonateQuoteSection.tsx",
  "src/components/donate/DonateBankTransferSection.tsx",
  "src/components/donate/DonateCampaignSection.tsx",
  "src/components/donate/DonateFundsSection.tsx",
  "src/components/donate/DonateMonthlySection.tsx",
  "src/components/donate/DonateContactSection.tsx",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const pageSource = read("src/app/donate/page.tsx");
for (const componentName of [
  "DonateToast",
  "DonateHeroSection",
  "DonateQuoteSection",
  "DonateBankTransferSection",
  "DonateCampaignSection",
  "DonateFundsSection",
  "DonateMonthlySection",
  "DonateContactSection",
]) {
  assert(pageSource.includes(componentName), `Donate page must compose ${componentName}.`);
}

for (const removedResponsibility of [
  "EditableText",
  "EditableLink",
  "EditableList",
  "SubHero",
  "lucide-react",
  "Bus",
  "Scale",
  "Megaphone",
  "Settings",
  "Check",
  "ExternalLink",
  "donate.funds.items",
  "donate.contact.phoneHref",
  "BANK_ACCOUNT_FULL",
]) {
  assert(
    !pageSource.includes(removedResponsibility),
    `Donate page should not own ${removedResponsibility}.`,
  );
}

const pageLines = pageSource.trimEnd().split("\n").length;
assert(pageLines <= 100, `Donate page should stay interaction-focused, got ${pageLines} lines.`);

const toastSource = read("src/components/donate/DonateToast.tsx");
for (const expected of ["Check", "aria-live", "role=\"status\""]) {
  assert(toastSource.includes(expected), `DonateToast must include ${expected}.`);
}

const bankSource = read("src/components/donate/DonateBankTransferSection.tsx");
for (const expected of [
  "DONATION_BANK_ACCOUNT",
  "DONATION_BANK_ACCOUNT_FULL",
  "onCopyAccount",
  "donate.bank.copy",
]) {
  assert(bankSource.includes(expected), `DonateBankTransferSection must include ${expected}.`);
}

const fundsSource = read("src/components/donate/DonateFundsSection.tsx");
for (const expected of ["EditableList", "donate.funds.items", "progressbar"]) {
  assert(fundsSource.includes(expected), `DonateFundsSection must include ${expected}.`);
}

const contactSource = read("src/components/donate/DonateContactSection.tsx");
for (const expected of ["EditableLink", "donate.contact.phoneHref", "donate.contact.campaignHref"]) {
  assert(contactSource.includes(expected), `DonateContactSection must include ${expected}.`);
}

console.log("Donate page refactor checks passed.");
