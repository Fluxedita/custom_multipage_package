import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';

export async function GET() {
  try {
    console.log('Auth test API: GET request received');
    const supabase = getSupabaseServerClient();
    // Test different auth methods
    const results: any = {
      getUser: null,
      getSession: null
    };
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      results.getUser = { user: user ? 'authenticated' : 'not authenticated', error: error?.message };
    } catch (e) {
      results.getUser = { error: e instanceof Error ? e.message : 'Unknown error' };
    }
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      results.getSession = { session: session ? 'exists' : 'no session', error: error?.message };
    } catch (e) {
      results.getSession = { error: e instanceof Error ? e.message : 'Unknown error' };
    }
    console.log('Auth test API: Results:', results);
    return NextResponse.json({ 
      message: 'Auth test completed',
      results 
    });
  } catch (error) {
    console.error('Auth test API error:', error);
    return NextResponse.json({ 
      error: 'Auth test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Auth test API: POST request received');
    const supabase = getSupabaseServerClient();
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const body = await request.json();
    return NextResponse.json({ 
      message: 'Auth test POST completed',
      auth: {
        user: user ? 'authenticated' : 'not authenticated',
        session: session ? 'exists' : 'no session',
        authError: authError?.message,
        sessionError: sessionError?.message
      },
      body
    });
  } catch (error) {
    console.error('Auth test API POST error:', error);
    return NextResponse.json({ 
      error: 'Auth test POST failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 