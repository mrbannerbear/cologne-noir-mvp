'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  Users,
  Boxes,
  Box,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeOrders } from '@/hooks/use-realtime-stock';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/products', label: 'Products', icon: FlaskConical },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/supplies', label: 'Supplies', icon: Box },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const pendingOrders = useRealtimeOrders();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r-2 border-foreground bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b-2 border-foreground p-6">
          <Link href="/admin" className="font-serif text-lg font-bold uppercase tracking-widest">
            Cologne Noir
          </Link>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
            Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const showBadge = item.href === '/admin/orders' && pendingOrders > 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-wider transition-colors',
                      isActive
                        ? 'border-2 border-foreground bg-foreground text-background'
                        : 'border-2 border-transparent hover:border-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                    {showBadge && (
                      <span className={cn(
                        'flex h-6 w-6 items-center justify-center text-xs font-bold',
                        isActive
                          ? 'bg-background text-foreground'
                          : 'bg-foreground text-background'
                      )}>
                        {pendingOrders}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t-2 border-foreground p-4">
          <Link
            href="/"
            className="mb-2 block px-4 py-2 text-sm font-medium uppercase tracking-wider transition-opacity hover:opacity-60"
          >
            View Store
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium uppercase tracking-wider transition-opacity hover:opacity-60"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
