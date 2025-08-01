import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

async function isAdminUser() {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return false;
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('membership_type')
    .eq('user_id', user.id)
    .single();
  if (profileError || profile?.membership_type !== 'admin') return false;
  return true;
}

export async function GET() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const supabase = getSupabaseAdminClient();
    // Fetch all comments and join user info from profiles
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        is_flagged,
        is_approved,
        user:profiles!comments_user_id_profiles_fkey (
          user_id,
          username,
          avatar_url,
          full_name
        )
      `)
      .order('created_at', { ascending: false });
    if (commentsError) throw commentsError;
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const supabase = getSupabaseAdminClient();
    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ comment: data });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const supabase = getSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}