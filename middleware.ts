import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/contact',
  '/about',
  '/products',
  '/terms',
  '/privacy',
  '/cookies',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/custom_pages',
  '/profile',
  '/profile/admin',
  '/admin',
];

// Helper function to check if a path is in a list of paths
const isPathInList = (path: string, pathList: string[]): boolean => {
  return pathList.some(p => path === p || path.startsWith(`${p}/`));
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public paths
  if (isPathInList(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  // Check for Supabase session cookie (sb-access-token)
  const accessToken = req.cookies.get('sb-access-token')?.value;

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth).*)',
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

