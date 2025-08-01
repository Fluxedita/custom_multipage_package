import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import supabase from '@/lib/supabase/client';

export function Header() {
  const { user, isAdmin } = useAuth();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .single();

        if (error) throw error;
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    }

    fetchSettings();
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">{settings?.site_name || 'Portfolio'}</span>
            </Link>
          </div>

          <div className="flex items-center">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
} 