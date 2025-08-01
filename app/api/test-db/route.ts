import { NextResponse } from 'next/server';

export async function GET() {
  // Prisma has been removed. If you want to test Supabase, add Supabase test code here.
  return NextResponse.json({
    status: 'success',
    message: 'Prisma removed. Supabase is now used for auth/database.'
  });
}
