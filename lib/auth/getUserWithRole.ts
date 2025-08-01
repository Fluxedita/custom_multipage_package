import { createClient } from '@supabase/supabase-js'

export async function getUserWithRole(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single()

  return { user: { id: userId }, role: profile?.role ?? null };
} 