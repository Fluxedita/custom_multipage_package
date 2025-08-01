import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = getSupabaseServerClient();

    // Get the hero section directly from page_sections
    const { data: heroSection, error: heroError } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_id', params.slug)
      .eq('section_type', 'hero')
      .single();

    console.log('GET hero section response:', { heroSection, heroError });

    if (heroError) {
      console.error('Error fetching hero section:', heroError);
      return NextResponse.json({ success: false, error: heroError.message }, { status: 500 });
    }

    // Transform the response to use camelCase for the frontend
    const transformedHero = heroSection ? {
      id: heroSection.id,
      type: heroSection.section_type,
      title: heroSection.title,
      description: heroSection.description,
      backgroundMedia: heroSection.background_media,
      mediaType: heroSection.media_type,
      width: heroSection.width,
      height: heroSection.height,
      enableSpeech: heroSection.enable_speech,
      enableTitleSpeech: heroSection.enable_title_speech,
      enableDescriptionSpeech: heroSection.enable_description_speech
    } : null;

    return NextResponse.json({ success: true, data: transformedHero });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = getSupabaseServerClient();

    // Get the user's session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('User check:', { user, error: userError });

    if (userError || !user) {
      console.error('No user found');
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Get the user's profile to check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('membership_type')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json({ success: false, error: 'Error fetching user profile' }, { status: 500 });
    }

    if (!profile || profile.membership_type !== 'admin') {
      console.error('User is not authorized:', { profile });
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    // Get request body
    const { backgroundMedia, title, description, mediaType, width, height } = await req.json();
    
    // Add debug logging
    console.log('Received hero section update:', {
      slug: params.slug,
      backgroundMedia,
      title,
      description,
      mediaType,
      width,
      height
    });

    if (!backgroundMedia) {
      console.error('Missing backgroundMedia in request');
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Update or insert the hero section
    const { data: updatedHero, error: updateError } = await supabase
      .from('page_sections')
      .upsert({
        page_id: params.slug,
        section_type: 'hero',
        access_level: 'public',
        title: title || null,
        description: description || null,
        background_media: backgroundMedia,
        media_type: mediaType || 'image',
        width: width || '1920',
        height: height || '1080',
        enable_speech: false,
        enable_title_speech: false,
        enable_description_speech: false,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      })
      .select()
      .single();

    console.log('Update response:', { updatedHero, updateError });

    if (updateError) {
      console.error('Error updating hero section:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to save changes' }, { status: 500 });
    }

    // Transform the response to use camelCase for the frontend
    const transformedHero = updatedHero ? {
      id: updatedHero.id,
      type: updatedHero.section_type,
      title: updatedHero.title,
      description: updatedHero.description,
      backgroundMedia: updatedHero.background_media,
      mediaType: updatedHero.media_type,
      width: updatedHero.width,
      height: updatedHero.height,
      enableSpeech: updatedHero.enable_speech,
      enableTitleSpeech: updatedHero.enable_title_speech,
      enableDescriptionSpeech: updatedHero.enable_description_speech
    } : null;

    console.log('Successfully updated hero section:', transformedHero);
    return NextResponse.json({ success: true, data: transformedHero });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
