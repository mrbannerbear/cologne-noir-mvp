'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';

const supabase = createClient();

export function useRealtimeStock(productId?: string) {
  const [stock, setStock] = useState<number | null>(null);

  useEffect(() => {
    if (!productId) return;

    // Fetch initial stock
    const fetchStock = async () => {
      const { data } = await supabase
        .from('products')
        .select('current_volume_ml')
        .eq('id', productId)
        .single();

      if (data) {
        setStock(data.current_volume_ml);
      }
    };

    fetchStock();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`product-stock-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          const newProduct = payload.new as Product;
          setStock(newProduct.current_volume_ml);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return stock;
}

export function useRealtimeLowStock() {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch initial low stock products
    const fetchLowStock = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .lt('current_volume_ml', 10)
        .eq('is_active', true);

      if (data) {
        setLowStockProducts(data);
      }
    };

    fetchLowStock();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('low-stock-products')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          // Refetch on any product change
          fetchLowStock();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return lowStockProducts;
}

export function useRealtimeOrders() {
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    // Fetch initial pending orders count
    const fetchPending = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending_payment', 'new']);

      setPendingCount(count || 0);
    };

    fetchPending();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('pending-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchPending();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return pendingCount;
}
