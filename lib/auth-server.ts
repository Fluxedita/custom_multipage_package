import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side auth helper
export async function createServerClient() {
  const cookieStore = cookies()
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: {
        getItem: (key) => {
          const cookie = cookieStore.get(key)
          return cookie?.value ?? null
        },
        setItem: (key, value) => {
          cookieStore.set(key, value, {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 week
          })
        },
        removeItem: (key) => {
          cookieStore.delete(key)
        }
      }
    }
  })

  return supabase
}

export async function auth() {
  try {
    const supabase = await createServerClient()
    
    // First try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return null
    }

    if (!session) {
      console.log('No session found')
      return null
    }

    // Then verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User verification error:', userError)
      return null
    }

    if (!user) {
      console.log('No user found after verification')
      return null
    }

    console.log('Full user object:', user)

    // Check if the session is expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at < now) {
      console.log('Session expired')
      return null
    }

    return {
      user,
      session
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

/**
 * Standardized admin check function that matches the AuthProvider logic
 * This ensures consistency across all API routes
 */
export async function checkAdminStatus(supabase: SupabaseClient, user: User): Promise<boolean> {
  try {
    // Check if user has admin role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    // Check role column
    if (profile?.role === 'admin') {
      console.log('Admin check: User has admin role in profiles table');
      return true;
    }
    
    // Fallback: Check admin email from app_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'admin_email')
      .single();
    
    const adminEmail = settingsData?.value;
    const isUserAdmin = user.email === adminEmail;
    
    console.log('Admin check:', {
      userEmail: user.email,
      adminEmail,
      isAdmin: isUserAdmin || profile?.role === 'admin',
      profileRole: profile?.role
    });
    
    return isUserAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
} 