import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Create a new Supabase client with the provided token
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
    
    // Get the user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ 
        error: 'Error fetching profile',
        details: profileError 
      }, { status: 500 });
    }

    const isAdmin = profile?.role === 'admin' || profile?.membership_type === 'premium';
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile,
      isAdmin: isAdmin,
      role: profile?.role,
      membershipType: profile?.membership_type,
    });
  } catch (error) {
    console.error('Error in test-user-profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 