import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { SaveMediaData, MediaItem } from '@/lib/types';
import { checkAdminStatus } from '@/lib/auth-server';

// CORS headers configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

// Convert SaveMediaData from the client into the DB column format
function toDbPayload(data: SaveMediaData) {
  const now = new Date().toISOString();
  const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    title: data.title,
    description: data.description ?? '',
    cover_image: data.coverImage,
    image_urls: data.imageUrls ?? [],
    video_url: data.videoUrl,
    is_premium: data.isPremium,
    type: data.type,
    tags: data.tags ?? [],
    featured: data.featured,
    order: data.order,
    slug,
    gallery_type: data.galleryType ?? 'public',
    background_image: data.backgroundImage,
    updated_at: now,
    url: data.imageUrls?.[0] || data.videoUrl || data.coverImage || '',
  } as const;
}

export async function POST(req: NextRequest) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 200, 
      headers: CORS_HEADERS 
    });
  }

  try {
    const supabase = getSupabaseServerClient();
    const supabaseAdmin = getSupabaseAdminClient();

    // Read the request body first to get the user ID
    const incoming: SaveMediaData & { userId?: string } = await req.json();
    const { userId, ...saveData } = incoming;

    console.log('Media save request:', {
      hasUserId: !!userId,
      userId,
      title: saveData.title,
      type: saveData.type
    });

    let user = null;

    // Try to get user from session
    const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser();
    if (sessionUser) {
      user = sessionUser;
      console.log('User authenticated via session:', user.id);
    }

    // If still no user, use userId from request body as fallback
    if (!user && userId) {
      console.log('Using userId from request body as fallback:', userId);
      // Verify the user exists in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profile && !profileError) {
        user = { id: userId, email: profile.email } as any;
        console.log('User verified from profiles table:', userId);
      } else {
        console.log('User not found in profiles table:', String(profileError));
      }
    }

    if (!user?.id) {
      console.error('No valid user found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' }, 
        { 
          status: 401, 
          headers: CORS_HEADERS 
        }
      );
    }
    // Enhanced admin role check with more detailed logging
    console.log('Starting admin check for user:', {
      userId: user.id,
      email: user.email
    });
    // Check admin status using standardized function
    const isAdmin = await checkAdminStatus(supabase, user);
    console.log('Admin verification:', {
      userEmail: user.email,
      finalIsAdmin: isAdmin
    });
    if (!isAdmin) {
      console.error('Admin access denied for user:', {
        userId: user.id,
        email: user.email
      });
      return NextResponse.json(
        { success: false, error: 'Admin access required' }, 
        { 
          status: 403, 
          headers: CORS_HEADERS 
        }
      );
    }
    const payload = toDbPayload(saveData);
    // Use service role client for database operations to bypass RLS
    let dbRes;
    if (saveData.id) {
      dbRes = await supabaseAdmin
        .from('media_items')
        .update(payload)
        .eq('id', saveData.id)
        .select()
        .single();
    } else {
      dbRes = await supabaseAdmin
        .from('media_items')
        .insert(payload)
        .select()
        .single();
    }
    if (dbRes.error) {
      console.error('Error saving media item:', dbRes.error);
      return NextResponse.json(
        { success: false, error: dbRes.error.message },
        { status: 500, headers: CORS_HEADERS }
      );
    }
    return NextResponse.json(
      { success: true, media: dbRes.data },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('Error in media/save API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
