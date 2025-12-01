import { z } from 'zod';

export const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Street address is required').max(200, 'Street address too long'),
  city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  state: z.string().min(1, 'State is required').max(100, 'State name too long'),
  postal_code: z.string().min(1, 'Postal code is required').max(20, 'Postal code too long'),
  country: z.string().min(1, 'Country is required').max(100, 'Country name too long'),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[+]?[\d\s-]{10,15}$/, 'Invalid phone number'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['cod', 'bkash'], {
    required_error: 'Payment method is required',
  }),
  bkashTransactionId: z.string().optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
}).refine(
  (data) => {
    if (data.paymentMethod === 'bkash') {
      return data.bkashTransactionId && data.bkashTransactionId.length > 0;
    }
    return true;
  },
  {
    message: 'bKash transaction ID is required for bKash payments',
    path: ['bkashTransactionId'],
  }
);

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    'pending_payment',
    'new',
    'decanting',
    'shipped',
    'delivered',
    'cancelled',
  ]),
  tracking_number: z.string().max(100, 'Tracking number too long').optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export type OrderStatusUpdateData = z.infer<typeof orderStatusUpdateSchema>;

export const paymentStatusUpdateSchema = z.object({
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']),
  bkash_transaction_id: z.string().optional(),
});

export type PaymentStatusUpdateData = z.infer<typeof paymentStatusUpdateSchema>;
