import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase/server';

export async function GET() {
  try {
    // Get settings from app_settings table
    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('key, value');

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Convert array of key-value pairs to object
    if (Array.isArray(settings)) {
      const settingsObject = settings.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);
      return NextResponse.json({ settings: settingsObject });
    } else {
      return NextResponse.json({ error: 'Unexpected format for settings' }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in /api/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 