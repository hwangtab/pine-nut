import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MESSAGE_MAX_LENGTH = 100;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const SERVICE_UNAVAILABLE_MESSAGE = "서명 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
const DUPLICATE_SIGNATURE_MESSAGE = "이미 서명하셨습니다. 참여해주셔서 감사합니다.";

const devRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimitedInDemoMode(ip: string): boolean {
  const now = Date.now();
  const entry = devRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    devRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

const DEMO_SIGNATURES = [
  { name: "김*수", message: "풍천리 주민분들 힘내세요!", created_at: "2026-03-10T09:00:00Z" },
  { name: "박*영", message: "자연을 지키는 일에 함께합니다.", created_at: "2026-03-09T14:00:00Z" },
  { name: "이*현", message: "응원합니다. 끝까지 싸워주세요.", created_at: "2026-03-09T10:00:00Z" },
  { name: "정*미", message: "작은 힘이라도 보태고 싶습니다.", created_at: "2026-03-08T16:00:00Z" },
  { name: "최*호", message: "", created_at: "2026-03-08T11:00:00Z" },
];

function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + "*";
  return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}

export async function GET() {
  if (!supabase) {
    if (IS_PRODUCTION) {
      return NextResponse.json({ error: SERVICE_UNAVAILABLE_MESSAGE }, { status: 503 });
    }

    return NextResponse.json({
      count: 2847,
      signatures: DEMO_SIGNATURES,
      demo: true,
    });
  }

  try {
    const { count, error: countError } = await supabase
      .from("signatures")
      .select("id", { count: "exact", head: true });

    if (countError) throw countError;

    const { data: signatures, error: sigError } = await supabase
      .from("signatures")
      .select("name, message, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (sigError) throw sigError;

    const maskedSignatures = (signatures || []).map((sig) => ({
      name: maskName(sig.name),
      message: sig.message || "",
      created_at: sig.created_at,
    }));

    return NextResponse.json({
      count: count || 0,
      signatures: maskedSignatures,
      demo: false,
    });
  } catch (error) {
    console.error("Failed to fetch signatures:", error);
    return NextResponse.json(
      { error: "Failed to fetch signatures" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  let body: { name?: string; email?: string; message?: string; agreePrivacy?: boolean; agreeAge?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, message, agreePrivacy, agreeAge } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  }
  if (name.trim().length > 50) {
    return NextResponse.json({ error: "이름이 너무 깁니다." }, { status: 400 });
  }
  if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }
  if (message && message.length > MESSAGE_MAX_LENGTH) {
    return NextResponse.json({ error: `메시지는 ${MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.` }, { status: 400 });
  }
  if (agreePrivacy !== true) {
    return NextResponse.json({ error: "개인정보 수집·이용 동의가 필요합니다." }, { status: 400 });
  }
  if (agreeAge !== true) {
    return NextResponse.json({ error: "만 14세 이상 확인이 필요합니다." }, { status: 400 });
  }

  if (!supabase) {
    if (IS_PRODUCTION) {
      return NextResponse.json({ error: SERVICE_UNAVAILABLE_MESSAGE }, { status: 503 });
    }

    if (isRateLimitedInDemoMode(ip)) {
      return NextResponse.json(
        { error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      count: 2848,
      demo: true,
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const messageText = (message || "").trim();
  const ipHash = hashIp(ip);
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();

  try {
    const { count: recentCount, error: rateLimitError } = await supabase
      .from("signatures")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", windowStart);

    if (rateLimitError) throw rateLimitError;

    if ((recentCount || 0) >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const { error: insertError } = await supabase
      .from("signatures")
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        message: messageText,
        ip_hash: ipHash,
        consent_privacy: agreePrivacy,
        consent_age: agreeAge,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ error: DUPLICATE_SIGNATURE_MESSAGE }, { status: 409 });
      }
      if (insertError.code === "P0001" && insertError.message.includes("rate_limit_exceeded")) {
        return NextResponse.json(
          { error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." },
          { status: 429 }
        );
      }
      throw insertError;
    }

    const { count, error: countError } = await supabase
      .from("signatures")
      .select("id", { count: "exact", head: true });

    if (countError) throw countError;

    return NextResponse.json({
      success: true,
      count: count || 0,
      demo: false,
    });
  } catch (error) {
    console.error("Failed to submit signature:", error);
    return NextResponse.json(
      { error: "Failed to submit signature" },
      { status: 500 }
    );
  }
}
