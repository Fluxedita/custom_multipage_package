import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';
import type { Database } from '@/lib/supabase/database.types';
import { createClient } from '@supabase/supabase-js';
import { checkAdminStatus } from '@/lib/auth-server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

async function isAdminUser() {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return false;
  
  return await checkAdminStatus(supabase, user);
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const supabase = getSupabaseServerClient();

  // Get page components by slug
  const { data: components, error: componentsError } = await supabase
    .from('root_page_components')
    .select('*')
    .eq('page_slug', slug)
    .eq('is_active', true);

  if (componentsError) {
    return NextResponse.json({ error: 'Failed to fetch page components' }, { status: 500 });
  }

  // Organize components by type
  const pageData: any = { slug };
  components?.forEach(component => {
    pageData[component.component_type] = component.content;
  });

  return NextResponse.json(pageData, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  const { slug } = params;
  // Use service role key for admin operations
  const supabase = getSupabaseAdminClient();

  const body = await req.json();
  const { sections, hero } = body;

  try {
    const updates = [];

    // Update sections if provided
    if (sections) {
      updates.push({
        page_slug: slug,
        component_type: 'sections',
        content: sections,
        is_active: true,
        updated_at: new Date().toISOString(),
      });
    }

    // Update hero if provided
    if (hero) {
      updates.push({
        page_slug: slug,
        component_type: 'hero',
        content: hero,
        is_active: true,
        updated_at: new Date().toISOString(),
      });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No data provided for update' }, { status: 400 });
    }

    // Update or insert components
    const { data: updated, error: updateError } = await supabase
      .from('root_page_components')
      .upsert(updates, {
        onConflict: 'page_slug,component_type'
      })
      .select();

    if (updateError) {
      console.error('Error updating page components:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { slug, components: updated } 
    }, { status: 200 });

  } catch (error) {
    console.error('Error in PUT /api/pages/[slug]:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 