import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServerClient();

  // Get the user from the session
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...profile,
    id: user.id,
    email: user.email,
  });
} 