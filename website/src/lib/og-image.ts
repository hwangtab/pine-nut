const FETCH_TIMEOUT = 5000;
const MAX_HTML_SIZE = 1024 * 1024; // 1MB

function extractOgImage(html: string): string | null {
  const match =
    html.match(/<meta\s+[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*\/?>/i) ??
    html.match(/<meta\s+[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:image["'][^>]*\/?>/i);

  if (!match?.[1]) return null;

  const url = match[1].trim();
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // 상대 URL이거나 유효하지 않은 URL
  }
  return null;
}

/**
 * URL에서 og:image 메타태그를 추출한다.
 * 실패 시 null 반환 (에러를 throw하지 않음).
 */
export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OGFetcher/1.0)",
          Accept: "text/html",
        },
      });
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) return null;

    const reader = response.body?.getReader();
    if (!reader) return null;

    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalSize += value.byteLength;
      if (totalSize > MAX_HTML_SIZE) break;
      chunks.push(value);
    }
    reader.cancel();

    const merged = new Uint8Array(totalSize > MAX_HTML_SIZE ? MAX_HTML_SIZE : totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      const remaining = merged.byteLength - offset;
      if (remaining <= 0) break;
      const toCopy = chunk.byteLength > remaining ? chunk.subarray(0, remaining) : chunk;
      merged.set(toCopy, offset);
      offset += toCopy.byteLength;
    }

    const html = new TextDecoder("utf-8", { fatal: false }).decode(merged);
    return extractOgImage(html);
  } catch {
    return null;
  }
}
