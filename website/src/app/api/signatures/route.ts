import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEMO_SIGNATURES = [
  { name: "김*수", message: "풍천리 주민분들 힘내세요!", created_at: "2026-03-10T09:00:00Z" },
  { name: "박*영", message: "자연을 지키는 일에 함께합니다.", created_at: "2026-03-09T14:00:00Z" },
  { name: "이*현", message: "응원합니다. 끝까지 싸워주세요.", created_at: "2026-03-09T10:00:00Z" },
  { name: "정*미", message: "작은 힘이라도 보태고 싶습니다.", created_at: "2026-03-08T16:00:00Z" },
  { name: "최*호", message: "", created_at: "2026-03-08T11:00:00Z" },
];

function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      count: 2847,
      signatures: DEMO_SIGNATURES,
      demo: true,
    });
  }

  try {
    const { count, error: countError } = await supabase
      .from('signatures')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    const { data: signatures, error: sigError } = await supabase
      .from('signatures')
      .select('name, message, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (sigError) throw sigError;

    const maskedSignatures = (signatures || []).map((sig) => ({
      name: maskName(sig.name),
      message: sig.message || '',
      created_at: sig.created_at,
    }));

    return NextResponse.json({
      count: count || 0,
      signatures: maskedSignatures,
      demo: false,
    });
  } catch (error) {
    console.error('Failed to fetch signatures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signatures' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, message } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 });
  }
  if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '올바른 이메일을 입력해주세요.' }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({
      success: true,
      count: 2848,
      demo: true,
    });
  }

  try {
    const { error: insertError } = await supabase
      .from('signatures')
      .insert({
        name: name.trim(),
        email: email.trim(),
        message: (message || '').trim(),
      });

    if (insertError) throw insertError;

    const { count, error: countError } = await supabase
      .from('signatures')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    return NextResponse.json({
      success: true,
      count: count || 0,
      demo: false,
    });
  } catch (error) {
    console.error('Failed to insert signature:', error);
    return NextResponse.json(
      { error: 'Failed to submit signature' },
      { status: 500 }
    );
  }
}
