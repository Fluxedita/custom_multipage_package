import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper to generate slugs from titles
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[_\s]+/g, '-')         // Replace spaces and underscores with dashes
    .replace(/[^a-z0-9-]/g, '')      // Remove all non-alphanumeric except dashes
    .replace(/-+/g, '-')             // Collapse multiple dashes
    .replace(/^-+|-+$/g, '');        // Trim leading/trailing dashes
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== New Page Creation Request ===');
    
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      console.error('No authorization token provided');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Create a new Supabase client with the provided token
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value;
            console.log(`Cookie ${name}:`, value ? 'Present' : 'Missing');
            return value;
          },
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
    
    // Get the user from the session
    console.log('🔍 [DEBUG] Getting user from session...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      const errorDetails = {
        message: 'Invalid session or user not found',
        error: userError,
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString()
      };
      console.error('❌ [AUTH] Authentication failed:', errorDetails);
      return NextResponse.json({ 
        error: 'Authentication required',
        details: errorDetails 
      }, { status: 401 });
    }
    
    console.log('✅ [AUTH] User authenticated:', { 
      id: user.id, 
      email: user.email,
      timestamp: new Date().toISOString()
    });
    
    // Check if user is admin by checking profiles table
    console.log('🔍 [AUTH] Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('membership_type, username, role, created_at, updated_at')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ [AUTH] Error fetching profile:', {
        error: profileError,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ 
        error: 'Error checking admin status',
        details: profileError 
      }, { status: 500 });
    }

    if (!profile) {
      console.error('❌ [AUTH] No profile found for user:', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ 
        error: 'User profile not found',
        userId: user.id 
      }, { status: 404 });
    }

    const isAdmin = profile.role === 'admin' || profile.membership_type === 'premium';
    
    console.log('🔍 [DEBUG] Profile details:', {
      userId: user.id,
      email: user.email,
      role: profile.role,
      membershipType: profile.membership_type,
      isAdmin: isAdmin,
      timestamp: new Date().toISOString()
    });
    
    if (!isAdmin) {
      const accessDeniedDetails = {
        message: 'Insufficient permissions',
        userId: user.id,
        userEmail: user.email,
        role: profile.role || 'not set',
        membershipType: profile.membership_type || 'not set',
        timestamp: new Date().toISOString(),
        requiredRoles: ['admin', 'premium']
      };
      
      console.error('🚫 [AUTH] Admin access denied:', accessDeniedDetails);
      
      return NextResponse.json({ 
        error: 'Admin access required',
        details: accessDeniedDetails
      }, { status: 403 });
    }
    
    console.log('✅ [AUTH] Admin access granted:', {
      userId: user.id,
      email: user.email,
      role: profile.role,
      membershipType: profile.membership_type,
      timestamp: new Date().toISOString()
    });

    const { title, type } = await req.json();
    console.log('Received request data:', { title, type });

    if (!title || !type || !['public', 'premium'].includes(type)) {
      return NextResponse.json({ error: 'Title and valid type are required' }, { status: 400 });
    }

    // Generate slug from title
    const baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let counter = 1;

    // Check if slug already exists in custom_pages
    while (true) {
      const { data: existingPage } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('slug', finalSlug)
        .maybeSingle();

      if (!existingPage) break;

      // If slug exists, append a counter and try again
      finalSlug = `${baseSlug}-${++counter}`;
    }

    console.log('Creating custom page with slug:', finalSlug);

    const insertData = {
      title,
      slug: finalSlug,
      content: {
        title,
        type,
        sections: [
          {
            id: 'hero',
            type: 'hero',
            title: 'Welcome to ' + title,
            subtitle: 'This is a new page. Edit this content to get started.',
            image: null,
            buttons: [],
            order: 0,
          },
          {
            id: 'content',
            type: 'content',
            title: 'About This Page',
            content: 'This is the default content section. You can edit this to add your own content.',
            order: 1,
          },
        ]
      },
      is_published: true,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    };

    console.log('🔍 [DEBUG] Insert data:', JSON.stringify(insertData, null, 2));

    // Create the custom page
    console.log('🔍 [DEBUG] Attempting to insert into custom_pages table...');
    
    const { data: pageData, error: pageError } = await supabase
      .from('custom_pages')
      .insert(insertData)
      .select()
      .single();

    if (pageError) {
      console.error('❌ [ERROR] Error creating custom page:', {
        error: pageError,
        message: pageError.message,
        details: pageError.details,
        hint: pageError.hint,
        code: pageError.code,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ error: pageError.message }, { status: 500 });
    }

    console.log('Created custom page:', pageData);

    return NextResponse.json({ 
      page: pageData
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in /api/pages/create:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
