'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { CreateCustomerFormData } from '@/lib/validations/customer';
import type { Profile } from '@/types';

const supabase = createClient();

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData: CreateCustomerFormData) => {
      // Generate a UUID for the admin-created customer
      const customerId = crypto.randomUUID();

      // Create profile directly in the profiles table
      // Note: These customers won't have auth.users entry and can't log in
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('profiles')
        .insert([
          {
            id: customerId,
            email: customerData.email,
            full_name: customerData.full_name,
            phone: customerData.phone,
            role: 'customer',
            shipping_address: customerData.shipping_address || {},
            favorite_brands: [],
            favorite_scents: [],
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-stats'] });
    },
  });
}
