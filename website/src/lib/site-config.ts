const DEFAULT_SITE_URL = "https://pungcheonri.vercel.app";

function resolveSiteUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "풍천리를 지켜주세요";
export const SITE_HOST = new URL(SITE_URL).host;
