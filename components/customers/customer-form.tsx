'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerUpdateSchema, type CustomerUpdateFormData } from '@/lib/validations/customer';
import { useUpdateCustomer } from '@/hooks/use-customers';
import type { Profile } from '@/types';

interface CustomerFormProps {
  customer: Profile;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const updateCustomer = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerUpdateFormData>({
    resolver: zodResolver(customerUpdateSchema),
    defaultValues: {
      full_name: customer.full_name || '',
      phone: customer.phone || '',
      shipping_address: customer.shipping_address || {},
      favorite_brands: customer.favorite_brands || [],
      favorite_scents: customer.favorite_scents || [],
      role: customer.role,
    },
  });

  const onSubmit = async (data: CustomerUpdateFormData) => {
    try {
      await updateCustomer.mutateAsync({ id: customer.id, data });
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  const inputClass =
    'w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-0';
  const labelClass = 'text-xs font-bold uppercase tracking-wider';
  const errorClass = 'mt-1 text-xs text-destructive';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name</label>
          <input
            {...register('full_name')}
            className={inputClass}
            placeholder="Full name"
          />
          {errors.full_name && (
            <p className={errorClass}>{errors.full_name.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input
            {...register('phone')}
            className={inputClass}
            placeholder="+880..."
          />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <label className={labelClass}>Shipping Address</label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <input
              {...register('shipping_address.street')}
              className={inputClass}
              placeholder="Street address"
            />
          </div>
          <div>
            <input
              {...register('shipping_address.city')}
              className={inputClass}
              placeholder="City"
            />
          </div>
          <div>
            <input
              {...register('shipping_address.state')}
              className={inputClass}
              placeholder="State/Division"
            />
          </div>
          <div>
            <input
              {...register('shipping_address.postal_code')}
              className={inputClass}
              placeholder="Postal code"
            />
          </div>
          <div>
            <input
              {...register('shipping_address.country')}
              className={inputClass}
              placeholder="Country"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Favorite Brands</label>
          <input
            {...register('favorite_brands')}
            className={inputClass}
            placeholder="Comma separated"
          />
          <p className="mt-1 text-xs text-muted-foreground">Comma separated</p>
        </div>
        <div>
          <label className={labelClass}>Favorite Scents</label>
          <input
            {...register('favorite_scents')}
            className={inputClass}
            placeholder="Comma separated"
          />
        </div>
      </div>

      {/* Role (admin only) */}
      <div>
        <label className={labelClass}>Role</label>
        <select {...register('role')} className={inputClass}>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-foreground/20 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border-2 border-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 border-2 border-foreground bg-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider text-background disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Update Customer'}
        </button>
      </div>
    </form>
  );
}
