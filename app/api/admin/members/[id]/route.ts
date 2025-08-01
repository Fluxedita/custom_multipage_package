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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { id } = params;
    
    // Use service role key for admin operations
    const supabase = getSupabaseAdminClient();

    // Delete the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', id);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      return NextResponse.json({ error: 'Failed to delete member profile' }, { status: 500 });
    }

    // Note: We cannot delete from auth.users directly via API
    // The user will need to be deleted manually from the Supabase dashboard
    // or through a server-side function with proper admin privileges

    return NextResponse.json({ 
      success: true, 
      message: 'Member profile deleted successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error in DELETE /api/admin/members/[id]:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 