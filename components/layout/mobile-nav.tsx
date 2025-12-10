'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Menu, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/cart', label: 'Cart' },
  { href: '/orders', label: 'Orders' },
];

export function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setUser(profile);
    };

    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        await fetchUserProfile(authUser.id);
      } else {
        setUser(null);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    window.location.href = '/';
  };

  // Close menu when navigating to a new page
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="font-serif text-lg font-bold uppercase tracking-widest">
            CN
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative p-2">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-foreground text-xs font-bold text-background">
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="border-t-2 border-foreground bg-background">
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'block border-b border-foreground/20 px-4 py-3 text-sm font-medium uppercase tracking-wider',
                      pathname === item.href && 'bg-foreground text-background'
                    )}
                  >
                    {item.label}
                    {item.href === '/cart' && itemCount > 0 && (
                      <span className="ml-2">({itemCount})</span>
                    )}
                  </Link>
                </li>
              ))}
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <li>
                      <Link
                        href="/admin"
                        onClick={handleLinkClick}
                        className="block border-b border-foreground/20 px-4 py-3 text-sm font-medium uppercase tracking-wider"
                      >
                        Admin Panel
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-3 text-left text-sm font-medium uppercase tracking-wider"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      onClick={handleLinkClick}
                      className="block border-b border-foreground/20 px-4 py-3 text-sm font-medium uppercase tracking-wider"
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      onClick={handleLinkClick}
                      className="block px-4 py-3 text-sm font-medium uppercase tracking-wider"
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
