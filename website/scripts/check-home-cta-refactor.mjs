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

const inlineFormPath = "src/components/home/HomeInlineSignatureForm.tsx";
assert(
  !existsSync(join(root, inlineFormPath)),
  "Home inline signature form must be removed — the petition flow now lives only at /petition.",
);
assert(
  !existsSync(join(root, "src/components/home/inline-signature")),
  "src/components/home/inline-signature must be removed along with the inline form.",
);

const sectionSource = read("src/components/home/HomeCtaSection.tsx");
for (const banned of [
  "HomeInlineSignatureForm",
  "onSignatureCountChange",
  "inline-signature",
  "validateSignatureForm",
  "submitSignatureForm",
]) {
  assert(
    !sectionSource.includes(banned),
    `HomeCtaSection must not reference the removed inline form: found ${banned}.`,
  );
}

assert(
  /href=["']\/petition["']/.test(sectionSource) || sectionSource.includes('defaultHref="/petition"'),
  "HomeCtaSection must link to /petition instead of embedding a signature form.",
);

const clientSource = read("src/components/home/HomeClient.tsx");
assert(
  !clientSource.includes("onSignatureCountChange"),
  "HomeClient must not wire onSignatureCountChange into HomeCtaSection anymore.",
);

console.log("Home CTA refactor checks passed.");
