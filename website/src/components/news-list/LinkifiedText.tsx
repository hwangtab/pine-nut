import type { ReactNode } from "react";

// 본문 속 맨 URL을 링크로 바꾼다. 소식 본문은 평문(텍스트) 저장이라
// 유튜브 링크 등이 클릭되지 않는 글자로만 보였다.
// - http(s)만 링크로 만든다(javascript:·data: 등은 정규식에 걸리지 않는다).
// - 문장 끝 마침표·쉼표·닫는 괄호는 URL에서 떼어 본문 글자로 돌려준다.
// - 유튜브 공유 링크의 `si=` 추적 파라미터는 표시·링크 양쪽에서 지운다.
const URL_PATTERN = /https?:\/\/[^\s<>"'`]+/g;
const TRAILING_PUNCTUATION = /[.,!?;:'"»」』)\]}>]+$/;
const YOUTUBE_HOSTS = new Set([
  "youtu.be",
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
]);

function splitTrailing(raw: string): [string, string] {
  let url = raw;
  let tail = "";
  const match = url.match(TRAILING_PUNCTUATION);
  if (match) {
    tail = match[0];
    url = url.slice(0, -tail.length);
    // 괄호가 URL 안에서 짝을 이루면(위키 링크 등) 닫는 괄호는 URL에 남긴다.
    while (tail.startsWith(")") && (url.match(/\(/g)?.length ?? 0) > (url.match(/\)/g)?.length ?? 0)) {
      url += ")";
      tail = tail.slice(1);
    }
  }
  return [url, tail];
}

export function cleanDisplayUrl(raw: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (YOUTUBE_HOSTS.has(parsed.hostname) && parsed.searchParams.has("si")) {
    parsed.searchParams.delete("si");
    return parsed.toString();
  }
  return raw;
}

export default function LinkifiedText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    const [rawUrl, tail] = splitTrailing(match[0]);
    const href = rawUrl ? cleanDisplayUrl(rawUrl) : null;
    if (!href) continue;

    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    parts.push(
      <a
        key={start}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-[var(--color-forest)] underline underline-offset-2 hover:text-[var(--color-forest-light)]"
      >
        {href}
      </a>,
    );
    if (tail) parts.push(tail);
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return <>{parts}</>;
}
