import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase-service';

export async function GET() {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const { error } = await supabase
    .from('signatures')
    .select('id')
    .limit(1);

  if (error) {
    return NextResponse.json({ error: 'Supabase ping failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}
