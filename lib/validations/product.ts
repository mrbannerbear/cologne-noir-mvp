import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Name too long'),
  brand: z.string().min(1, 'Brand is required').max(100, 'Brand name too long'),
  description: z.string().max(2000, 'Description too long').nullable().optional(),
  concentration: z.enum(['EDT', 'EDP', 'Extrait', 'Parfum', 'Cologne'], {
    required_error: 'Concentration type is required',
  }),
  gender: z.enum(['masculine', 'feminine', 'unisex'], {
    required_error: 'Gender type is required',
  }),
  season: z.enum(['spring', 'summer', 'fall', 'winter', 'all']).default('all'),
  total_volume_ml: z.coerce
    .number()
    .positive('Total volume must be positive')
    .max(1000, 'Volume cannot exceed 1000ml'),
  current_volume_ml: z.coerce
    .number()
    .min(0, 'Current volume cannot be negative')
    .max(1000, 'Volume cannot exceed 1000ml'),
  batch_code: z.string().max(50, 'Batch code too long').nullable().optional(),
  top_notes: z.array(z.string()).default([]),
  heart_notes: z.array(z.string()).default([]),
  base_notes: z.array(z.string()).default([]),
  price_10ml: z.coerce.number().positive().nullable().optional(),
  price_15ml: z.coerce.number().positive().nullable().optional(),
  price_30ml: z.coerce.number().positive().nullable().optional(),
  price_100ml: z.coerce.number().positive().nullable().optional(),
  image_url: z.string().url('Invalid image URL').nullable().optional(),
  is_active: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const volumeAdjustmentSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  new_volume: z.coerce
    .number()
    .min(0, 'Volume cannot be negative')
    .max(1000, 'Volume cannot exceed 1000ml'),
  reason: z.enum([
    'spillage',
    'evaporation',
    'quality_check',
    'damaged',
    'correction',
    'order_fulfillment',
    'other',
  ]),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export type VolumeAdjustmentFormData = z.infer<typeof volumeAdjustmentSchema>;
