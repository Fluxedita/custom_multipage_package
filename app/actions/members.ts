'use server'

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

function nullsToUndefined(obj: any) {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key] === null ? undefined : obj[key];
    }
  }
  return result;
}

export async function getMemberById(id: string) {
  try {
    const supabase = getSupabaseAdminClient();
    
    const { data: member, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) {
      console.error('Error fetching member:', error);
      return null;
    }

    if (!member) return null;
    return nullsToUndefined({ ...member, id: member.user_id });
  } catch (error) {
    console.error('Unexpected error fetching member:', error);
    return null;
  }
}

export async function getAllMembers() {
  try {
    const supabase = getSupabaseAdminClient();
    
    const { data: members, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
      return [];
    }

    return (members || []).map(member => nullsToUndefined({ ...member, id: member.user_id }));
  } catch (error) {
    console.error('Unexpected error fetching members:', error);
    return [];
  }
}

export async function updateHeroImage(userId: string, heroImageUrl: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('profiles')
      .update({ banner_url: heroImageUrl })
      .eq('user_id', userId);
    if (error) {
      console.error('Error updating hero image:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error updating hero image:', error);
    return false;
  }
} 