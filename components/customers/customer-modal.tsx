'use client';

import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { GSAPModal } from '@/components/shared/gsap-modal';
import { CustomerForm } from './customer-form';
import { formatCurrency, formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { CustomerWithStats, Order } from '@/types';

interface CustomerModalProps {
  customer: CustomerWithStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerModal({ customer, isOpen, onClose }: CustomerModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (customer && isOpen) {
      setIsLoadingOrders(true);
      supabase
        .from('orders')
        .select('*')
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(10)
        .then(({ data }) => {
          setOrders(data || []);
          setIsLoadingOrders(false);
        });
    }
  }, [customer, isOpen, supabase]);

  if (!customer) return null;

  const address = customer.shipping_address;

  return (
    <GSAPModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Customer' : customer.full_name || 'Customer Details'}
      size="lg"
    >
      {isEditing ? (
        <CustomerForm
          customer={customer}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="space-y-6">
          {/* Actions */}
          <div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 border-2 border-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border-2 border-foreground p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Orders
              </p>
              <p className="mt-2 font-serif text-3xl font-bold">
                {customer.order_count}
              </p>
            </div>
            <div className="border-2 border-foreground p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Spent
              </p>
              <p className="mt-2 font-serif text-3xl font-bold">
                {formatCurrency(customer.total_spent)}
              </p>
            </div>
            <div className="border-2 border-foreground p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Last Order
              </p>
              <p className="mt-2 font-serif text-xl font-bold">
                {customer.last_order_date
                  ? formatDate(customer.last_order_date)
                  : 'Never'}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </p>
              <p className="mt-1 font-medium">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Phone
              </p>
              <p className="mt-1 font-medium">{customer.phone || '-'}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Shipping Address
            </p>
            {address && Object.values(address).some(Boolean) ? (
              <div className="mt-1 text-sm">
                {address.street && <p>{address.street}</p>}
                <p>
                  {[address.city, address.state, address.postal_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {address.country && <p>{address.country}</p>}
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No address saved</p>
            )}
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Favorite Brands
              </p>
              {customer.favorite_brands.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {customer.favorite_brands.map((brand, i) => (
                    <span
                      key={i}
                      className="border border-foreground px-2 py-1 text-xs"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">None</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Favorite Scents
              </p>
              {customer.favorite_scents.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {customer.favorite_scents.map((scent, i) => (
                    <span
                      key={i}
                      className="border border-foreground px-2 py-1 text-xs"
                    >
                      {scent}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">None</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Recent Orders
            </p>
            {isLoadingOrders ? (
              <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
            ) : orders.length > 0 ? (
              <div className="mt-2 space-y-2">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border border-foreground/30 p-3"
                  >
                    <div>
                      <p className="font-mono text-sm">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs uppercase tracking-wider">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No orders yet</p>
            )}
          </div>

          {/* Meta */}
          <div className="border-t border-foreground/20 pt-4 text-xs text-muted-foreground">
            <p>Member since: {formatDate(customer.created_at)}</p>
          </div>
        </div>
      )}
    </GSAPModal>
  );
}
