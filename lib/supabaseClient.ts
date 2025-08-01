import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

// Helper to check if we're in the browser
const isBrowser = () => typeof window !== 'undefined';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      cookies: {
        get(name) {
          if (!isBrowser()) return null;
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`));
          return cookie ? cookie.split('=')[1] : null;
        },
        set(name, value, options) {
          if (!isBrowser()) return;
          document.cookie = `${name}=${value}; path=/; ${
            options?.maxAge ? `max-age=${options.maxAge}; ` : ''
          }${options?.domain ? `domain=${options.domain}; ` : ''}${
            options?.secure ? 'secure; ' : ''
          }${options?.httpOnly ? 'HttpOnly; ' : ''}${
            options?.sameSite ? `SameSite=${options.sameSite}; ` : ''
          }`;
        },
        remove(name, options) {
          if (!isBrowser()) return;
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${
            options?.domain ? `domain=${options.domain}; ` : ''
          }`;
        },
      },
    }
  );
}

// Initialize the client with proper typing
let supabase: ReturnType<typeof createClient>;

if (typeof window !== 'undefined') {
  // Browser environment
  supabase = createClient();
} else {
  // Server-side rendering - create a minimal mock client
  const mockClient = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
        in: () => ({
          select: () => Promise.resolve({ data: [], error: null })
        })
      }),
      insert: () => ({
        select: () => Promise.resolve({ data: null, error: null })
      }),
      update: () => ({
        eq: () => ({
          select: () => Promise.resolve({ data: null, error: null })
        })
      }),
      delete: () => ({
        eq: () => ({
          select: () => Promise.resolve({ data: null, error: null })
        })
      })
    }),
    channel: () => ({
      subscribe: () => ({
        on: () => ({
          unsubscribe: () => {}
        })
      })
    })
  } as unknown as ReturnType<typeof createClient>;
  
  supabase = mockClient;
}

export default supabase;