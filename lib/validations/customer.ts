import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s-]{10,15}$/, 'Invalid phone number')
    .nullable()
    .optional()
    .or(z.literal('')),
  shipping_address: z.object({
    street: z.string().max(200, 'Street address too long').optional(),
    city: z.string().max(100, 'City name too long').optional(),
    state: z.string().max(100, 'State name too long').optional(),
    postal_code: z.string().max(20, 'Postal code too long').optional(),
    country: z.string().max(100, 'Country name too long').optional(),
  }).optional(),
  favorite_brands: z.array(z.string()),
  favorite_scents: z.array(z.string()),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const customerUpdateSchema = profileSchema.extend({
  role: z.enum(['admin', 'customer']).optional(),
});

export type CustomerUpdateFormData = z.infer<typeof customerUpdateSchema>;

// Schema for creating a new customer from admin panel
export const createCustomerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s-]{10,15}$/, 'Invalid phone number'),
  shipping_address: z.object({
    street: z.string().max(200, 'Street address too long').optional(),
    city: z.string().max(100, 'City name too long').optional(),
    state: z.string().max(100, 'State name too long').optional(),
    postal_code: z.string().max(20, 'Postal code too long').optional(),
    country: z.string().max(100, 'Country name too long').optional(),
  }).optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;
