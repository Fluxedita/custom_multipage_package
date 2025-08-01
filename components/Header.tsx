"use client"

import { useState, useRef, useEffect } from "react"
import useSWR from 'swr';
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Camera, Lock, Info, Heart } from "lucide-react"
import { UserNav } from "./auth/UserNav"
import { useMobileMenu } from "@/hooks/useMobileMenu"
import supabase from '@/lib/supabase/client';
export function Header() {
  // Hooks and state declarations
  const { isOpen, toggle } = useMobileMenu();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  // SWR fetcher for custom pages
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error: customPagesError, isLoading: customPagesLoading, mutate: refreshCustomPages } = useSWR('/api/pages/list', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 0,
  });
  const customPages = data?.pages || [];
  
  // Debug logging
  useEffect(() => {
    if (data) {
      console.log('Custom pages data:', data);
      console.log('Custom pages array:', customPages);
    }
    if (customPagesError) {
      console.error('Custom pages error:', customPagesError);
    }
  }, [data, customPagesError, customPages]);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const mobileDropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 120);
  };

  const handleMobileDropdownEnter = () => {
    if (mobileDropdownTimeout.current) clearTimeout(mobileDropdownTimeout.current);
    setMobileDropdownOpen(true);
  };
  const handleMobileDropdownLeave = () => {
    mobileDropdownTimeout.current = setTimeout(() => setMobileDropdownOpen(false), 120);
  };

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    supabase.auth.getUser().then(({ data, error }) => {
      setUser(data?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const links = [
    { href: "/", label: "Home", icon: <Heart className="h-5 w-5" /> },
    { href: "/members", label: "Members", icon: <Lock className="h-5 w-5" /> },
    { href: "/about", label: "About", icon: <Info className="h-5 w-5" /> },
  ]

  // Get admin email from app_settings
  const settingsFetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: settingsData } = useSWR('/api/settings', settingsFetcher);
  const adminEmail = settingsData?.settings?.admin_email;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="hidden font-bold sm:inline-block">
              Fluxedita&nbsp;&nbsp;&nbsp;
            </span>
          </Link>
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Heart className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Multi Page Website Package
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <div className="relative" onMouseEnter={handleDropdownEnter} onMouseLeave={handleDropdownLeave}>
              <button className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center" type="button">
                Products
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 min-w-[160px] rounded-md bg-white shadow-lg z-50 border dark:bg-background">
                  <Link href="/products" className="block px-4 py-2 text-sm hover:bg-muted">Products</Link>
                  <Link href="/about" className="block px-4 py-2 text-sm hover:bg-muted">About</Link>
                  <Link href="/contact" className="block px-4 py-2 text-sm hover:bg-muted">Contact</Link>
                  
                  {/* Custom Pages */}
                  {customPagesLoading && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">Loading pages...</div>
                  )}
                  {customPagesError && (
                    <div className="px-4 py-2 text-sm text-red-500">Error loading pages</div>
                  )}
                  {customPages.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      {customPages
                        .filter((page: any) => page.slug !== 'contact' && page.title !== 'About' && page.title !== 'Contact' && page.title !== 'Gallery')
                        .map((page: any) => (
                          <Link
                            key={page.id}
                            href={`/custom_pages/${page.slug}`}
                            className="block px-4 py-2 text-sm hover:bg-muted"
                          >
                            {page.title}
                          </Link>
                        ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
          </nav>
        </div>
        <button
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={toggle}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {loading ? (
              null
            ) : user ? (
              <UserNav user={user} />
            ) : (
              <div className="flex items-center space-x-2">
              </div>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-14 z-50 h-[calc(100vh-3.5rem)] overflow-y-auto bg-background/95 backdrop-blur-sm md:hidden"
          >
            <div className="container px-4 py-2 space-y-1">
              <nav className="flex flex-col space-y-1">
                {/* Home Link */}
                <Link
                  href="/"
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors ${
                    pathname === '/' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                  }`}
                  onClick={toggle}
                >
                  <Heart className="mr-3 h-5 w-5" />
                  Home
                </Link>

                {/* Products Dropdown */}
                <div className="relative">
                  <button
                    className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-md transition-colors ${
                      mobileDropdownOpen ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                    type="button"
                    aria-expanded={mobileDropdownOpen}
                    aria-controls="mobile-products-dropdown"
                  >
                    <div className="flex items-center">
                      <Camera className="mr-3 h-5 w-5" />
                      <span>Products</span>
                    </div>
                    <svg 
                      className={`ml-2 h-4 w-4 transform transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {mobileDropdownOpen && (
                      <motion.div
                        id="mobile-services-dropdown"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-8 mt-1 space-y-1 overflow-hidden rounded-md bg-muted/50"
                      >
                        <Link 
                          href="/products" 
                          className="block px-4 py-2 text-sm hover:bg-muted"
                          onClick={toggle}
                        >
                          Products
                        </Link>
                        <Link 
                          href="/about" 
                          className="block px-4 py-2 text-sm hover:bg-muted"
                          onClick={toggle}
                        >
                          About
                        </Link>
                        <Link 
                          href="/contact" 
                          className="block px-4 py-2 text-sm hover:bg-muted"
                          onClick={toggle}
                        >
                          Contact
                        </Link>
                        
                        {/* Custom Pages */}
                        {customPagesLoading && (
                          <div className="px-4 py-2 text-sm text-muted-foreground">Loading pages...</div>
                        )}
                        {customPagesError && (
                          <div className="px-4 py-2 text-sm text-red-500">Error loading pages</div>
                        )}
                        {customPages.length > 0 && (
                          <>
                            <div className="border-t border-border mx-2 my-1"></div>
                            {customPages
                              .filter((page: any) => page.title !== 'About' && page.title !== 'Contact' && page.title !== 'Gallery')
                              .map((page: any) => (
                                <Link
                                  key={page.id}
                                  href={`/custom_pages/${page.slug}`}
                                  className="block px-4 py-2 text-sm hover:bg-muted"
                                  onClick={toggle}
                                >
                                  {page.title}
                                </Link>
                              ))}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* About Link */}
                <Link
                  href="/about"
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors ${
                    pathname === '/about' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                  }`}
                  onClick={toggle}
                >
                  <Info className="mr-3 h-5 w-5" />
                  About
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

