import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';
import { checkAdminStatus } from '@/lib/auth-server';

// Fetch page_content by slug (GET)
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  try {
    const supabase = getSupabaseServerClient();
    // Get the custom page from custom_pages table
    const { data: pageRow, error: pageError } = await supabase
      .from('custom_pages')
      .select('id, slug, title, content, is_published, created_at, updated_at')
      .eq('slug', slug)
      .single();
    if (pageError || !pageRow) {
      console.error('Error fetching custom page:', pageError);
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    // content is expected to be { sections, properties }
    const content = pageRow.content || {};
    return NextResponse.json({ page: pageRow, content }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update page_content.sections (PATCH)
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const supabase = getSupabaseServerClient();
  // Verify the user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  try {
    // Check if user is admin using standardized function
    const isAdmin = await checkAdminStatus(supabase, user);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to update this page' },
        { status: 403 }
      );
    }
    // Get the request body
    let body;
    try {
      body = await req.json();
      console.log('Received PATCH request with body:', JSON.stringify(body, null, 2));
    } catch (e) {
      console.error('Error parsing request body:', e);
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Failed to parse JSON' },
        { status: 400 }
      );
    }
    const { sections, properties } = body;
    if (!sections || !Array.isArray(sections)) {
      console.error('Invalid sections data:', sections);
      return NextResponse.json(
        { error: 'Invalid sections data', details: 'Sections must be an array' },
        { status: 400 }
      );
    }
    // Ensure each section has an ID
    const updatedSections = sections.map((section: any) => ({
      ...section,
      id: section.id || crypto.randomUUID()
    }));
    // Fetch the current custom page row to get required fields
    const { data: currentPage, error: fetchError } = await supabase
      .from('custom_pages')
      .select('id, slug, title, is_published, created_at, created_by, meta_description, meta_keywords')
      .eq('slug', slug)
      .single();
    if (fetchError || !currentPage) {
      console.error('Custom page not found for upsert:', fetchError);
      return NextResponse.json(
        { error: 'Custom page not found. Cannot update.' },
        { status: 404 }
      );
    }
    // Upsert to custom_pages table with all required fields
    const { error: upsertError } = await supabase
      .from('custom_pages')
      .upsert({
        id: currentPage.id,
        slug,
        title: currentPage.title,
        is_published: currentPage.is_published,
        created_at: currentPage.created_at,
        created_by: currentPage.created_by,
        meta_description: currentPage.meta_description,
        meta_keywords: currentPage.meta_keywords,
        content: { sections: updatedSections, properties: properties || {} },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' });
    if (upsertError) {
      console.error('Error updating custom page:', upsertError);
      return NextResponse.json(
        { error: 'Failed to update custom page' },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Custom page updated successfully',
      sections: updatedSections,
      properties: properties || {}
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}