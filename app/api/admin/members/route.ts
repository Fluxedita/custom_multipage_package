import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';
import type { Database } from '@/lib/supabase/database.types';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(req: NextRequest) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    // Use service role key for admin operations
    const supabase = getSupabaseAdminClient();

    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }

    // Transform the data to match the expected format
    const members = profiles?.map(profile => ({
      id: profile.user_id,
      user_id: profile.user_id,
      full_name: profile.full_name,
      username: profile.username,
      email: profile.email,
      bio: profile.bio,
      age: profile.age,
      city: profile.city,
      country: profile.country,
      occupation: profile.occupation,
      hobbies: profile.hobbies,
      avatar_url: profile.avatar_url,
      banner_url: profile.banner_url,
      video_intro_url: profile.video_intro_url,
      additional_notes: profile.additional_notes,
      first_name: profile.first_name,
      last_name: profile.last_name,
      bio_message: profile.bio_message,
      membership_type: profile.membership_type,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      membership_changed_at: profile.membership_changed_at,
      membership_changed_by: profile.membership_changed_by,
      membership_reason: profile.membership_reason,
    })) || [];

    return NextResponse.json({ 
      success: true, 
      members 
    }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/admin/members:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const supabase = getSupabaseAdminClient();
    const adminClient = getSupabaseAdminClient();
    const body = await req.json();

    let { user_id, email, password, full_name, username, ...rest } = body;

    // If user_id is not provided, create the user in Supabase Auth
    if (!user_id) {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required to create a new user.' }, { status: 400 });
      }
      const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
        email,
        password,
        user_metadata: { full_name, username }
      });
      if (userError || !userData?.user) {
        console.error('Error creating auth user:', userError);
        return NextResponse.json({ error: 'Failed to create auth user', details: userError?.message }, { status: 500 });
      }
      user_id = userData.user.id;
    }

    // At this point, the DB trigger should have created the profile row. Update it with additional fields.
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...rest,
        full_name,
        username,
        email
      })
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating member profile:', error);
      return NextResponse.json({ error: 'Failed to update member profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, member: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 