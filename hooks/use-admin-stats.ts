'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { AdminStats } from '@/types';

const supabase = createClient();

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats');

      if (error) throw error;
      return data as AdminStats;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useLowStockProducts(threshold = 10) {
  return useQuery({
    queryKey: ['low-stock-products', threshold],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_low_stock_products', {
        p_threshold: threshold,
      });

      if (error) throw error;
      return data;
    },
  });
}
