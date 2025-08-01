import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';

export async function POST(request: NextRequest) {
  console.log('=== POST /api/comments ===');

  try {
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Unauthorized: Invalid or expired session', userError);
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing comment for user:', user.id);
    const { content, pageSlug } = await request.json();
    if (!content?.trim()) {
      return new NextResponse(
        JSON.stringify({ error: 'Comment content is required' }),
        { status: 400 }
      );
    }

    // Insert the comment
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        content: content.trim(),
        page_slug: pageSlug || null,
        is_approved: true
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create comment', details: error.message }),
        { status: 500 }
      );
    }

    // Fetch the comment with user profile data
    const { data: commentWithUser, error: fetchError } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', data.id)
      .single();

    if (fetchError) {
      console.error('Error fetching comment with user data:', fetchError);
      return NextResponse.json(data);
    }

    return NextResponse.json(commentWithUser);
  } catch (error) {
    console.error('Error in comments API:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get('pageSlug');
    
    const supabase = getSupabaseServerClient();

    let query = supabase
      .from('comments')
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (pageSlug) {
      query = query.eq('page_slug', pageSlug);
    }

    const { data: comments, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch comments' }), 
        { status: 500 }
      );
    }

    return NextResponse.json(comments || []);
  } catch (error) {
    console.error('Error in comments API:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
}