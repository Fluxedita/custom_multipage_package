'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function getAdminSession() {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    return { session: null, error: error || new Error('No active session') }
  }

  // Check if user has admin role
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (userError || userData?.role !== 'admin') {
    return { session: null, error: new Error('Unauthorized') }
  }

  return { session, error: null }
}
