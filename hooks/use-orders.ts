'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderWithItems, OrderItem, Profile } from '@/types';
import type { CheckoutFormData, OrderStatusUpdateData, PaymentStatusUpdateData } from '@/lib/validations/order';
import { useCart } from './use-cart';

const supabase = createClient();

// Fetch user's orders
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
}

// Fetch all orders (admin)
export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
}

// Fetch single order with items
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      return { ...(order as unknown as Order), items: items as unknown as OrderItem[] } as OrderWithItems;
    },
    enabled: !!id,
  });
}

// Fetch order with items and profile (admin)
export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;
      
      const order = orderData as unknown as Order;

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', order.user_id)
        .single();

      return { 
        ...order, 
        items: items as unknown as OrderItem[], 
        profile: profile as unknown as Profile | undefined 
      } as OrderWithItems;
    },
    enabled: !!id,
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { clearCart, cart } = useCart();

  return useMutation({
    mutationFn: async (checkoutData: CheckoutFormData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Create order
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: order, error: orderError } = await (supabase as any)
        .from('orders')
        .insert([
          {
            user_id: user.id,
            status: checkoutData.paymentMethod === 'cod' ? 'new' : 'pending_payment',
            payment_method: checkoutData.paymentMethod,
            payment_status: 'pending',
            bkash_transaction_id: checkoutData.bkashTransactionId || null,
            subtotal: cart.subtotal,
            shipping_cost: cart.shippingCost,
            total: cart.total,
            shipping_address: checkoutData.shippingAddress,
            notes: checkoutData.notes || null,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems: Omit<OrderItem, 'id' | 'created_at'>[] = cart.items.map(
        (item) => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          size_value: item.sizeValue,
          product_name: item.productName,
          product_brand: item.productBrand,
          batch_code: item.batchCode,
        })
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: itemsError } = await (supabase as any)
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order as Order;
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

// Update order status (admin)
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: OrderStatusUpdateData;
    }) => {
      const updates: Record<string, unknown> = { status: data.status };
      
      if (data.tracking_number) {
        updates.tracking_number = data.tracking_number;
      }
      if (data.notes) {
        updates.notes = data.notes;
      }
      if (data.status === 'shipped') {
        updates.shipped_at = new Date().toISOString();
      }
      if (data.status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: order, error } = await (supabase as any)
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return order as Order;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', data.id] });
    },
  });
}

// Update payment status (admin)
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: PaymentStatusUpdateData;
    }) => {
      const updates: Record<string, unknown> = { payment_status: data.payment_status };
      
      if (data.bkash_transaction_id) {
        updates.bkash_transaction_id = data.bkash_transaction_id;
      }

      // If payment is confirmed, update order status to 'new' if pending
      if (data.payment_status === 'paid') {
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('status')
          .eq('id', id)
          .single();

        const orderData = currentOrder as unknown as { status: string } | null;
        if (orderData?.status === 'pending_payment') {
          updates.status = 'new';
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: order, error } = await (supabase as any)
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return order as Order;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', data.id] });
    },
  });
}

// Process order (decant) - admin
export function useProcessOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('process_decant_order', {
        p_order_id: orderId,
        p_admin_id: user.id,
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Unknown error');

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}
