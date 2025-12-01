'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { LoadingPage } from '@/components/shared/loading-spinner';
import { CreateOrderModal } from '@/components/admin/create-order-modal';
import { useAdminOrders } from '@/hooks/use-orders';
import { cn, formatCurrency, formatDate, formatOrderId } from '@/lib/utils';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants';

export default function AdminOrdersPage() {
  const { data: orders, isLoading, refetch } = useAdminOrders();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-wider">
            Orders
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage customer orders and fulfillment
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 border-2 border-foreground bg-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider text-background transition-colors hover:bg-transparent hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          New Order
        </button>
      </div>

      {/* Orders Table */}
      {!orders || orders.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center border-2 border-dashed border-foreground/30">
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-foreground">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-foreground bg-foreground text-background">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Method
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-foreground/20 transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono font-bold hover:underline"
                    >
                      {formatOrderId(order.id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block px-2 py-1 text-xs font-bold uppercase',
                        order.status === 'pending_payment' && 'bg-destructive/20 text-destructive',
                        order.status === 'new' && 'bg-foreground text-background',
                        order.status === 'decanting' && 'bg-foreground/20',
                        order.status === 'shipped' && 'border border-foreground',
                        order.status === 'delivered' && 'bg-muted',
                        order.status === 'cancelled' && 'bg-destructive text-white'
                      )}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-xs font-bold uppercase',
                        order.payment_status === 'paid' && 'text-foreground',
                        order.payment_status === 'pending' && 'text-destructive',
                        order.payment_status === 'failed' && 'text-destructive',
                        order.payment_status === 'refunded' && 'text-muted-foreground'
                      )}
                    >
                      {PAYMENT_STATUS_LABELS[order.payment_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm uppercase">
                    {PAYMENT_METHOD_LABELS[order.payment_method]}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
