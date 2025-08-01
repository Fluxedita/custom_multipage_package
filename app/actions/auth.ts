'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function getServerSession() {
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

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return null
    }

    if (!session) {
      console.log('No session found')
      return null
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User verification error:', userError)
      return null
    }

    if (!user) {
      console.log('No user found after verification')
      return null
    }

    // Check if the session is expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at < now) {
      console.log('Session expired')
      return null
    }

    // Fetch user's role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
    }

    // Add role to user metadata if not present
    const userWithRole = {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        role: profile?.role || user.user_metadata?.role || 'user'
      },
      role: profile?.role || user.user_metadata?.role || 'user',
    };

    return {
      user: userWithRole,
      session: {
        ...session,
        user: userWithRole
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function updateUserMetadata(userId: string, metadata: any) {
  try {
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
    
    // Fetch user's role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
    }

    // Add role to user metadata if not present
    const updatedMetadata = {
      ...metadata,
      role: profile?.role || 'user'
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: updatedMetadata
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error updating user metadata:', error)
    return { success: false, error }
  }
} 