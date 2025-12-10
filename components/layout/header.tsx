'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        setUser(profile);
      } else {
        setUser(null);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="font-serif text-xl font-bold uppercase tracking-widest">
          Cologne Noir
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium uppercase tracking-wider transition-opacity hover:opacity-60',
                pathname === item.href && 'border-b-2 border-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 transition-opacity hover:opacity-60"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center border border-foreground bg-foreground text-xs font-bold text-background">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="hidden items-center gap-4 md:flex">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-sm font-medium uppercase tracking-wider transition-opacity hover:opacity-60"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/orders"
                className="text-sm font-medium uppercase tracking-wider transition-opacity hover:opacity-60"
              >
                Orders
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium uppercase tracking-wider transition-opacity hover:opacity-60"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden p-2 transition-opacity hover:opacity-60 md:block"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t-2 border-foreground bg-background md:hidden">
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'border-b border-foreground/20 px-4 py-3 text-sm font-medium uppercase tracking-wider',
                  pathname === item.href && 'bg-foreground text-background'
                )}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="border-b border-foreground/20 px-4 py-3 text-sm font-medium uppercase tracking-wider"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="border-b border-foreground/20 px-4 py-3 text-sm font-medium uppercase tracking-wider"
                >
                  Orders
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                  className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium uppercase tracking-wider"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
