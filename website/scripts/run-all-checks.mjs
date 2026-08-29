// 이 저장소에는 테스트 프레임워크가 없다 — scripts/check-*.mjs 51+종이 그 역할을
// 대신한다. 각 가드는 package.json에 "<name>:check" 스크립트로만 등록되고, 이를
// 한 번에 돌리는 집합 스크립트가 없어 리뷰에서 "가드가 자동 실행되지 않는다"는
// 지적이 반복됐다. 이 스크립트가 그 빈 자리를 채운다.
//
// 가드 목록을 이 파일에 하드코딩하지 않는다 — package.json의 스크립트 중
// "node scripts/check-*.mjs" 형태인 것을 그대로 훑어서 실행한다. 그래야 새
// 가드가 추가될 때마다 이 스크립트를 같이 고칠 필요가 없다.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

// 정확 일치 패턴이다 — "node scripts/check-x.mjs --strict"처럼 뒤에 플래그가
// 붙는 가드가 생기면 이 정규식에 걸리지 않아 조용히 이 목록에서 빠진다. 지금은
// 그런 가드가 없지만, 새 가드를 추가할 때 이 제약을 잊지 말 것 — 플래그가
// 필요하면 이 패턴도 함께 넓혀야 한다.
const CHECK_SCRIPT_PATTERN = /^node scripts\/check-[\w-]+\.mjs$/;

const guardNames = Object.entries(pkg.scripts)
  .filter(([, command]) => CHECK_SCRIPT_PATTERN.test(command))
  .map(([name]) => name)
  .sort();

if (guardNames.length === 0) {
  console.error("No check-*.mjs guard scripts found in package.json.");
  process.exit(1);
}

console.log(`Running ${guardNames.length} guard script(s)...\n`);

const results = [];
for (const name of guardNames) {
  const command = pkg.scripts[name];
  const [bin, ...args] = command.split(" ");
  const result = spawnSync(bin, args, { cwd: root, encoding: "utf8" });
  const passed = result.status === 0;
  results.push({ name, passed, output: (result.stdout || "") + (result.stderr || "") });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}`);
  if (!passed) {
    console.log(result.stdout?.trim());
    console.error(result.stderr?.trim());
  }
}

const failed = results.filter((r) => !r.passed);
console.log(`\n${results.length - failed.length}/${results.length} guards passed.`);

if (failed.length > 0) {
  console.error(`\nFailed: ${failed.map((r) => r.name).join(", ")}`);
  process.exit(1);
}
