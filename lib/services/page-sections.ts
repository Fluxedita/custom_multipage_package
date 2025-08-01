import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { PageSection, PageSectionUpdate } from '@/lib/types/page-sections';
import supabase from '@/lib/supabase/client';

export async function getPageSection(slug: string, sectionType: string) {

  const { data, error } = await supabase
    .from('page_sections')
    .select('*')
    .eq('slug', slug)
    .eq('section_type', sectionType)
    .single();

  if (error) {
    console.error('Error fetching page section:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updatePageSection(
  slug: string,
  sectionType: string,
  updates: PageSectionUpdate
) {
  const session = await supabase.auth.getSession();

  if (!session.data.session?.user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get user's profile to check admin status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', session.data.session.user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    console.error('Profile error or not admin:', profileError);
    return { success: false, error: 'Not authorized' };
  }

  const { data, error } = await supabase
    .from('page_sections')
    .update({
      ...updates,
      updated_by: session.data.session.user.id,
      updated_at: new Date().toISOString()
    })
    .eq('slug', slug)
    .eq('section_type', sectionType)
    .select()
    .single();

  if (error) {
    console.error('Error updating page section:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function checkPageAccess(slug: string) {
  
  const { data, error } = await supabase
    .rpc('check_page_access', { slug: slug });

  if (error) {
    console.error('Error checking page access:', error);
    return false;
  }

  return data;
}
