import supabase from './supabaseClient';
export default supabase;

// Authentication helpers
export async function signInWithEmail(email: string, redirectTo: string = '/dashboard') {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function getUserSubscription() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // For now, return null since we don't have a subscriptions table
  // This can be implemented later when subscription functionality is added
  return null;
}

// Storage helpers
export const STORAGE_BUCKET = 'media';

export async function uploadFile(bucket: string, path: string, file: File) {
  return await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
}

export function getPublicUrl(bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function deleteFile(bucket: string, paths: string[]) {
  return await supabase.storage.from(bucket).remove(paths);
}
