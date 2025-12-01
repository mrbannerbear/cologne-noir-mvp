'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Package, CheckCircle } from 'lucide-react';
import { LoadingPage } from '@/components/shared/loading-spinner';
import { useOrders } from '@/hooks/use-orders';
import { formatCurrency, formatDate, formatOrderId } from '@/lib/utils';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const successOrderId = searchParams.get('success');
  const { data: orders, isLoading } = useOrders();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
  }, [supabase]);

  if (isAuthenticated === false) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold">Please sign in</h2>
          <p className="mt-2 text-muted-foreground">
            You need to be signed in to view your orders.
          </p>
          <Link
            href="/login?redirect=/orders"
            className="mt-4 inline-block border-2 border-foreground px-6 py-2 font-medium uppercase tracking-wider"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || isAuthenticated === null) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen">
      {/* Success Message */}
      {successOrderId && (
        <div className="border-b-2 border-foreground bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8" />
              <div>
                <h2 className="font-bold">Order Placed Successfully!</h2>
                <p className="text-sm text-background/80">
                  Order {formatOrderId(successOrderId)} has been received.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold uppercase tracking-wider">
            Your Orders
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center border-2 border-foreground">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-2xl font-bold">No orders yet</h2>
            <p className="mt-2 text-muted-foreground">
              Start shopping to see your orders here.
            </p>
            <Link
              href="/products"
              className="mt-8 border-2 border-foreground bg-foreground px-8 py-3 font-medium uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border-2 border-foreground">
                {/* Order Header */}
                <div className="flex flex-col gap-4 border-b border-foreground/20 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-lg font-bold">
                      {formatOrderId(order.id)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="border-2 border-foreground px-3 py-1 text-sm font-bold uppercase">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-bold uppercase ${
                        order.payment_status === 'paid'
                          ? 'bg-foreground text-background'
                          : 'border-2 border-destructive text-destructive'
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[order.payment_status]}
                    </span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Payment Method
                      </p>
                      <p className="mt-1 font-medium uppercase">
                        {order.payment_method === 'cod'
                          ? 'Cash on Delivery'
                          : 'bKash'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Total
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    {order.tracking_number && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Tracking Number
                        </p>
                        <p className="mt-1 font-mono">{order.tracking_number}</p>
                      </div>
                    )}
                    {order.shipped_at && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Shipped
                        </p>
                        <p className="mt-1">{formatDate(order.shipped_at)}</p>
                      </div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Shipping Address
                    </p>
                    <p className="mt-1 text-sm">
                      {order.shipping_address.street}
                      <br />
                      {order.shipping_address.city}, {order.shipping_address.state}{' '}
                      {order.shipping_address.postal_code}
                      <br />
                      {order.shipping_address.country}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
