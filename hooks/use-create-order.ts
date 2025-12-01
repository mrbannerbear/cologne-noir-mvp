'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderItem } from '@/types';

const supabase = createClient();

interface OrderItemData {
  product_id: string;
  quantity: number;
  unit_price: number;
  size_value: number;
  product_name: string;
  product_brand: string;
  batch_code: string | null;
}

interface CreateOrderData {
  user_id: string;
  payment_method: 'cod' | 'bkash';
  bkash_transaction_id?: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  notes?: string;
  items: OrderItemData[];
}

export function useAdminCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      // Create order with status 'new' for COD, 'pending_payment' for bKash
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: order, error: orderError } = await (supabase as any)
        .from('orders')
        .insert([
          {
            user_id: orderData.user_id,
            status: orderData.payment_method === 'cod' ? 'new' : 'pending_payment',
            payment_method: orderData.payment_method,
            payment_status: 'pending',
            bkash_transaction_id: orderData.bkash_transaction_id || null,
            subtotal: orderData.subtotal,
            shipping_cost: orderData.shipping_cost,
            total: orderData.total,
            shipping_address: orderData.shipping_address,
            notes: orderData.notes || null,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems: Omit<OrderItem, 'id' | 'created_at'>[] = orderData.items.map(
        (item) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          size_value: item.size_value,
          product_name: item.product_name,
          product_brand: item.product_brand,
          batch_code: item.batch_code,
        })
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: itemsError } = await (supabase as any)
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Try to process order if COD (deduct inventory)
      if (orderData.payment_method === 'cod') {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).rpc('process_decant_order', {
            p_order_id: order.id,
            p_admin_id: user.id,
          });
        }
      }

      return order as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}
