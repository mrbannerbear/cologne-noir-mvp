'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Profile, CustomerWithStats } from '@/types';
import type { CustomerUpdateFormData } from '@/lib/validations/customer';

const supabase = createClient();

// Fetch all customers (admin only)
export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });
}

// Fetch customers with stats
export function useCustomersWithStats() {
  return useQuery({
    queryKey: ['customers-with-stats'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch order stats for each customer
      const customersWithStats: CustomerWithStats[] = await Promise.all(
        profiles.map(async (profile) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('total, created_at')
            .eq('user_id', profile.id)
            .eq('payment_status', 'paid');

          const totalSpent = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
          const orderCount = orders?.length || 0;
          const lastOrderDate =
            orders && orders.length > 0
              ? orders.sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0].created_at
              : null;

          return {
            ...profile,
            total_spent: totalSpent,
            order_count: orderCount,
            last_order_date: lastOrderDate,
          };
        })
      );

      return customersWithStats;
    },
  });
}

// Fetch single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!id,
  });
}

// Fetch current user's profile
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: customerData,
    }: {
      id: string;
      data: CustomerUpdateFormData;
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(customerData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Update current user's profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: Partial<Profile>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
