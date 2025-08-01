import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    // Simple query without complex joins first
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Comments query error:', commentsError);
      throw commentsError;
    }

    // If we have comments, fetch user data separately
    if (comments && comments.length > 0) {
      const userIds = [...new Set(comments.map(c => c.user_id))];
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url, full_name')
        .in('user_id', userIds);
      if (usersError) {
        console.error('Users query error:', usersError);
        // Continue without user data rather than failing
      }
      // Combine the data
      const commentsWithUsers = comments.map(comment => {
        const user = users?.find(u => u.user_id === comment.user_id) || {
          user_id: comment.user_id,
          username: 'Unknown User',
          avatar_url: null,
          full_name: null
        };
        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          is_flagged: comment.is_flagged,
          is_approved: comment.is_approved,
          user
        };
      });
      return NextResponse.json({ comments: commentsWithUsers });
    }
    return NextResponse.json({ comments: [] });
  } catch (error) {
    console.error('Error in simple comments API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch comments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Simple API: POST request received');
    // Read request body first to get user ID and page slug
    const { content, userId, pageSlug } = await request.json();
    console.log('Simple API: Content received:', content ? 'yes' : 'no');
    console.log('Simple API: User ID from request:', userId);
    console.log('Simple API: Page slug from request:', pageSlug);
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }
    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment too long (max 1000 characters)' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const supabase = getSupabaseServerClient();
    // Try to get the user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const finalUserId = user?.id || userId;
    // Verify the user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, username')
      .eq('user_id', finalUserId)
      .single();
    if (profileError || !profile) {
      console.log('Simple API: User not found in profiles table:', finalUserId);
      return NextResponse.json({ 
        error: 'User not found in profiles table',
        debug: { userId: finalUserId, profileError: profileError?.message }
      }, { status: 400 });
    }
    console.log('Simple API: User verified in profiles table:', profile.username);
    console.log('Simple API: Inserting comment for user:', finalUserId);
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: finalUserId,
        content: content.trim(),
        page_slug: pageSlug || null
      })
      .select()
      .single();
    if (error) {
      console.error('Simple API: Database error:', error);
      throw error;
    }
    console.log('Simple API: Comment created successfully:', data.id);
    return NextResponse.json({ comment: data });
  } catch (error) {
    console.error('Error creating comment in simple API:', error);
    return NextResponse.json({ 
      error: 'Failed to create comment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 