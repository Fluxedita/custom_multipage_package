// List of routes that should be dynamically rendered
export const dynamicRoutes = [
  '/profile',
  '/admin',
  '/admin/analytics',
  '/admin/content',
  '/admin/members',
  '/admin/settings',
  '/auth/login',
  '/auth/signup',
  '/auth/test',
  '/dashboard',
  '/gallery',
  '/media',
  '/members',
  '/subscription',
  '/subscription/cancel',
  '/subscription/checkout',
  '/subscription/success',
]

// List of routes that should be statically generated
export const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/cookies',
  '/privacy',
  '/terms',
]

// Helper function to check if a route should be dynamic
export function isDynamicRoute(pathname: string): boolean {
  return dynamicRoutes.some(route => pathname.startsWith(route))
}

// Helper function to check if a route should be static
export function isStaticRoute(pathname: string): boolean {
  return staticRoutes.some(route => pathname === route)
} 