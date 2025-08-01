import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';
import { checkAdminStatus } from '@/lib/auth-server';

// This route needs to be dynamic to handle different requests
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    
    // Initialize auth variables
    let isAdmin = false;
    let user = null;
    
    // Safely get the user's session
    try {
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      
      if (!userError && authUser) {
        user = authUser;
        // Check if user has admin role using standardized function
        isAdmin = await checkAdminStatus(supabase, authUser);
      }
    } catch (authError) {
      console.error('Auth check error:', authError);
      // Continue with public access if auth check fails
    }

    // Build the query for custom pages only
    let query = supabase
      .from('custom_pages')
      .select('id, title, slug, content, created_at, updated_at, is_published')
      .order('created_at', { ascending: false });

    // If user is not authenticated or not admin, only show published pages
    if (!user || !isAdmin) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process the data to extract type from content and filter if needed
    const processedPages = data?.map(page => {
      let pageType = 'public'; // default
      try {
        if (page.content && typeof page.content === 'object' && !Array.isArray(page.content)) {
          const contentObj = page.content as { [key: string]: any };
          pageType = contentObj.type || 'public';
        }
      } catch (e) {
        console.error('Error parsing page content:', e);
      }
      
      return {
        ...page,
        type: pageType
      };
    }).filter(page => {
      // Filter by type for non-admin users
      if (!user || !isAdmin) {
        return page.type === 'public';
      }
      return true;
    }) || [];

    return NextResponse.json({ pages: processedPages });
  } catch (error) {
    console.error('Unexpected error in /api/pages/list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}