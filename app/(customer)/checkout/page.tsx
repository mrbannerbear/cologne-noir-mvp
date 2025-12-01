'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations/order';
import { CartSummary } from '@/components/cart/cart-summary';
import { PaymentSelector } from '@/components/checkout/payment-selector';
import { useCart } from '@/hooks/use-cart';
import { useCreateOrder } from '@/hooks/use-orders';
import { useProfile } from '@/hooks/use-customers';
import { createClient } from '@/lib/supabase/client';
import type { PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { data: profile } = useProfile();
  const createOrder = useCreateOrder();
  const supabase = createClient();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'cod',
      bkashTransactionId: '',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const bkashTransactionId = watch('bkashTransactionId') || '';

  // Check authentication
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
      if (!user) {
        router.push('/login?redirect=/checkout');
      }
    });
  }, [supabase, router]);

  // Pre-fill form with profile data
  useEffect(() => {
    if (profile) {
      setValue('fullName', profile.full_name || '');
      setValue('email', profile.email);
      setValue('phone', profile.phone || '');
      if (profile.shipping_address) {
        setValue('shippingAddress.street', profile.shipping_address.street || '');
        setValue('shippingAddress.city', profile.shipping_address.city || '');
        setValue('shippingAddress.state', profile.shipping_address.state || '');
        setValue(
          'shippingAddress.postal_code',
          profile.shipping_address.postal_code || ''
        );
        setValue('shippingAddress.country', profile.shipping_address.country || 'Bangladesh');
      }
    }
  }, [profile, setValue]);

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const order = await createOrder.mutateAsync(data);
      router.push(`/orders?success=${order.id}`);
    } catch {
      // Error handled by mutation
    }
  };

  // Redirect if cart is empty
  if (itemCount === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold">Your cart is empty</h2>
          <Link href="/products" className="mt-4 inline-block underline">
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const inputClass =
    'w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none';
  const labelClass = 'text-xs font-bold uppercase tracking-wider';
  const errorClass = 'mt-1 text-xs text-destructive';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/cart"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="font-serif text-4xl font-bold uppercase tracking-wider">
            Checkout
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Form */}
            <div className="space-y-8 lg:col-span-2">
              {/* Contact Info */}
              <div className="border-2 border-foreground p-6">
                <h2 className="mb-6 font-serif text-xl font-bold uppercase">
                  Contact Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      {...register('fullName')}
                      className={inputClass}
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className={errorClass}>{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      {...register('email')}
                      type="email"
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className={errorClass}>{errors.email.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Phone *</label>
                    <input
                      {...register('phone')}
                      className={inputClass}
                      placeholder="+880 1XXX XXXXXX"
                    />
                    {errors.phone && (
                      <p className={errorClass}>{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-2 border-foreground p-6">
                <h2 className="mb-6 font-serif text-xl font-bold uppercase">
                  Shipping Address
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Street Address *</label>
                    <input
                      {...register('shippingAddress.street')}
                      className={inputClass}
                      placeholder="123 Main St"
                    />
                    {errors.shippingAddress?.street && (
                      <p className={errorClass}>
                        {errors.shippingAddress.street.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>City *</label>
                    <input
                      {...register('shippingAddress.city')}
                      className={inputClass}
                      placeholder="Dhaka"
                    />
                    {errors.shippingAddress?.city && (
                      <p className={errorClass}>
                        {errors.shippingAddress.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>State/Division *</label>
                    <input
                      {...register('shippingAddress.state')}
                      className={inputClass}
                      placeholder="Dhaka"
                    />
                    {errors.shippingAddress?.state && (
                      <p className={errorClass}>
                        {errors.shippingAddress.state.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Postal Code *</label>
                    <input
                      {...register('shippingAddress.postal_code')}
                      className={inputClass}
                      placeholder="1205"
                    />
                    {errors.shippingAddress?.postal_code && (
                      <p className={errorClass}>
                        {errors.shippingAddress.postal_code.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Country *</label>
                    <input
                      {...register('shippingAddress.country')}
                      className={inputClass}
                      placeholder="Bangladesh"
                    />
                    {errors.shippingAddress?.country && (
                      <p className={errorClass}>
                        {errors.shippingAddress.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="border-2 border-foreground p-6">
                <h2 className="mb-6 font-serif text-xl font-bold uppercase">
                  Payment Method
                </h2>
                <PaymentSelector
                  value={paymentMethod}
                  onChange={(method) => setValue('paymentMethod', method)}
                  bkashTransactionId={bkashTransactionId}
                  onBkashIdChange={(id) => setValue('bkashTransactionId', id)}
                  error={errors.bkashTransactionId?.message}
                />
              </div>

              {/* Notes */}
              <div className="border-2 border-foreground p-6">
                <h2 className="mb-6 font-serif text-xl font-bold uppercase">
                  Order Notes (Optional)
                </h2>
                <textarea
                  {...register('notes')}
                  className={`${inputClass} min-h-[100px] resize-none`}
                  placeholder="Any special instructions for your order..."
                />
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CartSummary showCheckoutButton={false} />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 w-full border-2 border-foreground bg-foreground py-4 font-medium uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </button>
                {createOrder.isError && (
                  <p className="mt-2 text-center text-sm text-destructive">
                    Failed to place order. Please try again.
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
