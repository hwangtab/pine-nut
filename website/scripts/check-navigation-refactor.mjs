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
  "src/components/navigation/NavigationLink.tsx",
  "src/components/navigation/NavigationLogo.tsx",
  "src/components/navigation/DesktopNavigation.tsx",
  "src/components/navigation/MobileNavigationButton.tsx",
  "src/components/navigation/MobileNavigationMenu.tsx",
  "src/components/navigation/useNavigationChrome.ts",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const navSource = read("src/components/Navigation.tsx");
for (const expected of [
  "useNavigationChrome",
  "NavigationLogo",
  "DesktopNavigation",
  "MobileNavigationButton",
  "MobileNavigationMenu",
]) {
  assert(navSource.includes(expected), `Navigation must compose ${expected}.`);
}

for (const removedResponsibility of [
  "useState",
  "useEffect",
  "useRef",
  "renderNavLink",
  "EditableLink",
  "EditableText",
  "querySelectorAll",
  "document.body.style.overflow",
  "window.addEventListener",
  "Menu, X",
]) {
  assert(!navSource.includes(removedResponsibility), `Navigation should not own ${removedResponsibility}.`);
}

// 공개 화면의 경로 판정은 usePublicPathname 을 거쳐야 한다. Vercel 이 홈을
// 재생성할 때 usePathname() 이 "/index" 를 돌려줘, 투명 내비·상단 여백·커스텀
// 섹션이 "홈 아님"으로 그려진 채 CDN 에 굳은 적이 있다(lib/use-public-pathname.ts).
for (const path of [
  "src/components/Navigation.tsx",
  "src/components/PublicShell.tsx",
  "src/components/Footer.tsx",
  "src/components/CustomSectionsHost.tsx",
]) {
  const source = read(path);
  assert(source.includes("usePublicPathname"), `${path} must read the path through usePublicPathname.`);
  assert(!/from "next\/navigation"[^\n]*usePathname|usePathname\(\)/.test(source), `${path} must not call usePathname directly.`);
}

const navLines = navSource.trimEnd().split("\n").length;
assert(navLines <= 130, `Navigation should stay orchestration-focused, got ${navLines} lines.`);

const chromeSource = read("src/components/navigation/useNavigationChrome.ts");
for (const expected of [
  "window.addEventListener",
  "document.body.style.overflow",
  "querySelectorAll",
  "Escape",
  "requestAnimationFrame",
]) {
  assert(chromeSource.includes(expected), `useNavigationChrome must include ${expected}.`);
}

const linkSource = read("src/components/navigation/NavigationLink.tsx");
for (const expected of ["isInternalEditableHref", "isExternalEditableHref", "next/link"]) {
  assert(linkSource.includes(expected), `NavigationLink must include ${expected}.`);
}

const desktopSource = read("src/components/navigation/DesktopNavigation.tsx");
for (const expected of ["nav.cta.href", "nav.cta", "NavigationLink"]) {
  assert(desktopSource.includes(expected), `DesktopNavigation must include ${expected}.`);
}

const mobileSource = read("src/components/navigation/MobileNavigationMenu.tsx");
for (const expected of ["role=\"dialog\"", "aria-modal=\"true\"", "nav.cta.href", "NavigationLink"]) {
  assert(mobileSource.includes(expected), `MobileNavigationMenu must include ${expected}.`);
}

console.log("Navigation refactor checks passed.");
