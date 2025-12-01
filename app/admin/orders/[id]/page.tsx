'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { LoadingPage } from '@/components/shared/loading-spinner';
import { GSAPModal } from '@/components/shared/gsap-modal';
import {
  useAdminOrder,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useProcessOrder,
} from '@/hooks/use-orders';
import { cn, formatCurrency, formatDate, formatDateTime, formatOrderId } from '@/lib/utils';
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/lib/constants';
import type { OrderStatus, PaymentStatus } from '@/types';

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading } = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdatePaymentStatus();
  const processOrder = useProcessOrder();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!order) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    await updateStatus.mutateAsync({
      id: order.id,
      data: {
        status: selectedStatus,
        tracking_number: trackingNumber || undefined,
      },
    });

    setShowStatusModal(false);
    setSelectedStatus(null);
    setTrackingNumber('');
  };

  const handlePaymentUpdate = async (status: PaymentStatus) => {
    await updatePayment.mutateAsync({
      id: order.id,
      data: { payment_status: status },
    });
    setShowPaymentModal(false);
  };

  const handleProcessOrder = async () => {
    if (confirm('Process this order? This will deduct inventory.')) {
      await processOrder.mutateAsync(order.id);
    }
  };

  const statuses: OrderStatus[] = [
    'pending_payment',
    'new',
    'decanting',
    'shipped',
    'delivered',
    'cancelled',
  ];

  const paymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-wider">
            Order {formatOrderId(order.id)}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Placed on {formatDateTime(order.created_at)}
          </p>
        </div>

        <div className="flex gap-2">
          {order.status === 'new' && order.payment_status === 'paid' && (
            <button
              onClick={handleProcessOrder}
              disabled={processOrder.isPending}
              className="border-2 border-foreground bg-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider text-background disabled:opacity-50"
            >
              {processOrder.isPending ? 'Processing...' : 'Process Order'}
            </button>
          )}
          <button
            onClick={() => setShowStatusModal(true)}
            className="border-2 border-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider"
          >
            Update Status
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="border-2 border-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider"
          >
            Update Payment
          </button>
        </div>
      </div>

      {/* Status & Payment */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-2 border-foreground p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Status
          </p>
          <p
            className={cn(
              'mt-2 text-lg font-bold uppercase',
              order.status === 'pending_payment' && 'text-destructive',
              order.status === 'cancelled' && 'text-destructive'
            )}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </p>
        </div>
        <div className="border-2 border-foreground p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Payment Status
          </p>
          <p
            className={cn(
              'mt-2 text-lg font-bold uppercase',
              order.payment_status === 'paid' && 'text-foreground',
              order.payment_status !== 'paid' && 'text-destructive'
            )}
          >
            {PAYMENT_STATUS_LABELS[order.payment_status]}
          </p>
        </div>
        <div className="border-2 border-foreground p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Payment Method
          </p>
          <p className="mt-2 text-lg font-bold uppercase">
            {PAYMENT_METHOD_LABELS[order.payment_method]}
          </p>
          {order.bkash_transaction_id && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              TxID: {order.bkash_transaction_id}
            </p>
          )}
        </div>
        <div className="border-2 border-foreground bg-foreground p-4 text-background">
          <p className="text-xs font-bold uppercase tracking-wider text-background/70">
            Total
          </p>
          <p className="mt-2 font-serif text-2xl font-bold">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      {/* Customer & Shipping */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer */}
        <div className="border-2 border-foreground p-6">
          <h2 className="mb-4 font-serif text-xl font-bold uppercase">Customer</h2>
          {order.profile ? (
            <div className="space-y-2">
              <p className="font-medium">{order.profile.full_name || 'No name'}</p>
              <p className="text-sm text-muted-foreground">{order.profile.email}</p>
              {order.profile.phone && (
                <p className="text-sm text-muted-foreground">{order.profile.phone}</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Customer data unavailable</p>
          )}
        </div>

        {/* Shipping */}
        <div className="border-2 border-foreground p-6">
          <h2 className="mb-4 font-serif text-xl font-bold uppercase">
            Shipping Address
          </h2>
          <div className="space-y-1 text-sm">
            <p>{order.shipping_address.street}</p>
            <p>
              {order.shipping_address.city}, {order.shipping_address.state}{' '}
              {order.shipping_address.postal_code}
            </p>
            <p>{order.shipping_address.country}</p>
          </div>
          {order.tracking_number && (
            <div className="mt-4 border-t border-foreground/20 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tracking Number
              </p>
              <p className="mt-1 font-mono">{order.tracking_number}</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="border-2 border-foreground">
        <div className="border-b-2 border-foreground bg-foreground p-4 text-background">
          <h2 className="font-serif text-xl font-bold uppercase">Order Items</h2>
        </div>
        <div className="divide-y divide-foreground/20">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="flex h-16 w-16 items-center justify-center border border-foreground/30 bg-muted">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.product_brand} • {item.size_value}ml
                </p>
                {item.batch_code && (
                  <p className="font-mono text-xs text-muted-foreground">
                    Batch: {item.batch_code}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-mono font-bold">
                  {formatCurrency(item.unit_price)} x {item.quantity}
                </p>
                <p className="font-mono text-sm text-muted-foreground">
                  {formatCurrency(item.unit_price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-foreground p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-mono">{formatCurrency(order.shipping_cost)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-foreground/20 pt-2">
            <span className="font-bold uppercase">Total</span>
            <span className="font-mono text-lg font-bold">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="border-2 border-foreground p-6">
          <h2 className="mb-2 font-serif text-xl font-bold uppercase">Order Notes</h2>
          <p className="text-sm text-muted-foreground">{order.notes}</p>
        </div>
      )}

      {/* Status Update Modal */}
      <GSAPModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Order Status"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider">
              New Status
            </label>
            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm"
            >
              <option value="">Select status...</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {selectedStatus === 'shipped' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm"
                placeholder="Enter tracking number"
              />
            </div>
          )}

          <button
            onClick={handleStatusUpdate}
            disabled={!selectedStatus || updateStatus.isPending}
            className="w-full border-2 border-foreground bg-foreground py-2 text-sm font-medium uppercase tracking-wider text-background disabled:opacity-50"
          >
            {updateStatus.isPending ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </GSAPModal>

      {/* Payment Update Modal */}
      <GSAPModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Update Payment Status"
        size="sm"
      >
        <div className="space-y-2">
          {paymentStatuses.map((status) => (
            <button
              key={status}
              onClick={() => handlePaymentUpdate(status)}
              disabled={updatePayment.isPending}
              className={cn(
                'w-full border-2 border-foreground p-3 text-left text-sm font-medium uppercase tracking-wider',
                order.payment_status === status && 'bg-foreground text-background'
              )}
            >
              {PAYMENT_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </GSAPModal>
    </div>
  );
}
