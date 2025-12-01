'use client';

import Link from 'next/link';
import { cn, formatCurrency, formatDate, formatOrderId } from '@/lib/utils';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import type { Order } from '@/types';

interface OrderPipelineProps {
  orders: Order[];
}

const STATUS_ORDER = ['pending_payment', 'new', 'decanting', 'shipped', 'delivered'] as const;

export function OrderPipeline({ orders }: OrderPipelineProps) {
  // Group orders by status
  const groupedOrders = STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = orders.filter((o) => o.status === status);
      return acc;
    },
    {} as Record<string, Order[]>
  );

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold">Order Pipeline</h3>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => (
          <div
            key={status}
            className="min-w-[280px] flex-shrink-0 border-2 border-foreground"
          >
            {/* Header */}
            <div
              className={cn(
                'flex items-center justify-between border-b-2 border-foreground p-4',
                status === 'pending_payment' && 'bg-destructive/10',
                status === 'new' && 'bg-foreground text-background'
              )}
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                {ORDER_STATUS_LABELS[status]}
              </span>
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center text-xs font-bold',
                  status === 'new'
                    ? 'bg-background text-foreground'
                    : 'bg-foreground text-background'
                )}
              >
                {groupedOrders[status].length}
              </span>
            </div>

            {/* Orders */}
            <div className="max-h-[400px] overflow-y-auto p-2">
              {groupedOrders[status].length > 0 ? (
                <div className="space-y-2">
                  {groupedOrders[status].map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="block border border-foreground/30 p-3 transition-colors hover:border-foreground"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-sm font-bold">
                            {formatOrderId(order.id)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <p className="font-mono text-sm font-bold">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={cn(
                            'text-xs uppercase',
                            order.payment_status === 'paid'
                              ? 'text-foreground'
                              : 'text-destructive'
                          )}
                        >
                          {PAYMENT_STATUS_LABELS[order.payment_status]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {order.payment_method.toUpperCase()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No orders
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
