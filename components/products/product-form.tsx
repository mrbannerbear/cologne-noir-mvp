'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '@/lib/validations/product';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-products';
import type { Product } from '@/types';

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          brand: product.brand,
          description: product.description || '',
          concentration: product.concentration,
          gender: product.gender,
          season: product.season,
          total_volume_ml: product.total_volume_ml,
          current_volume_ml: product.current_volume_ml,
          batch_code: product.batch_code || '',
          top_notes: product.top_notes,
          heart_notes: product.heart_notes,
          base_notes: product.base_notes,
          price_10ml: product.price_10ml || undefined,
          price_15ml: product.price_15ml || undefined,
          price_30ml: product.price_30ml || undefined,
          price_100ml: product.price_100ml || undefined,
          image_url: product.image_url || '',
          is_active: product.is_active,
        }
      : {
          concentration: 'EDP',
          gender: 'unisex',
          season: 'all',
          is_active: true,
          top_notes: [],
          heart_notes: [],
          base_notes: [],
        },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, data });
      } else {
        await createProduct.mutateAsync(data);
      }
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
          <label className={labelClass}>Name *</label>
          <input {...register('name')} className={inputClass} placeholder="Product name" />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Brand *</label>
          <input {...register('brand')} className={inputClass} placeholder="Brand name" />
          {errors.brand && <p className={errorClass}>{errors.brand.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          {...register('description')}
          className={`${inputClass} min-h-[80px] resize-none`}
          placeholder="Product description"
        />
        {errors.description && (
          <p className={errorClass}>{errors.description.message}</p>
        )}
      </div>

      {/* Type Fields */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Concentration *</label>
          <select {...register('concentration')} className={inputClass}>
            <option value="EDT">Eau de Toilette</option>
            <option value="EDP">Eau de Parfum</option>
            <option value="Extrait">Extrait de Parfum</option>
            <option value="Parfum">Parfum</option>
            <option value="Cologne">Cologne</option>
          </select>
          {errors.concentration && (
            <p className={errorClass}>{errors.concentration.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Gender *</label>
          <select {...register('gender')} className={inputClass}>
            <option value="masculine">Masculine</option>
            <option value="feminine">Feminine</option>
            <option value="unisex">Unisex</option>
          </select>
          {errors.gender && <p className={errorClass}>{errors.gender.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Season</label>
          <select {...register('season')} className={inputClass}>
            <option value="all">All Seasons</option>
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="fall">Fall</option>
            <option value="winter">Winter</option>
          </select>
          {errors.season && <p className={errorClass}>{errors.season.message}</p>}
        </div>
      </div>

      {/* Volume Fields */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Total Volume (ml) *</label>
          <input
            {...register('total_volume_ml', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className={inputClass}
            placeholder="100"
          />
          {errors.total_volume_ml && (
            <p className={errorClass}>{errors.total_volume_ml.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Current Volume (ml) *</label>
          <input
            {...register('current_volume_ml', { valueAsNumber: true })}
            type="number"
            step="0.01"
            className={inputClass}
            placeholder="100"
          />
          {errors.current_volume_ml && (
            <p className={errorClass}>{errors.current_volume_ml.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Batch Code</label>
          <input
            {...register('batch_code')}
            className={inputClass}
            placeholder="ABC123"
          />
          {errors.batch_code && (
            <p className={errorClass}>{errors.batch_code.message}</p>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <label className={labelClass}>Pricing (BDT)</label>
        <div className="mt-2 grid grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">10ml</label>
            <input
              {...register('price_10ml', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">15ml</label>
            <input
              {...register('price_15ml', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">30ml</label>
            <input
              {...register('price_30ml', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">100ml</label>
            <input
              {...register('price_100ml', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Top Notes</label>
          <input
            {...register('top_notes')}
            className={inputClass}
            placeholder="Comma separated"
          />
          <p className="mt-1 text-xs text-muted-foreground">Comma separated</p>
        </div>
        <div>
          <label className={labelClass}>Heart Notes</label>
          <input
            {...register('heart_notes')}
            className={inputClass}
            placeholder="Comma separated"
          />
        </div>
        <div>
          <label className={labelClass}>Base Notes</label>
          <input
            {...register('base_notes')}
            className={inputClass}
            placeholder="Comma separated"
          />
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className={labelClass}>Image URL</label>
        <input
          {...register('image_url')}
          type="url"
          className={inputClass}
          placeholder="https://..."
        />
        {errors.image_url && (
          <p className={errorClass}>{errors.image_url.message}</p>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-2">
        <input
          {...register('is_active')}
          type="checkbox"
          id="is_active"
          className="h-4 w-4 border-2 border-foreground"
        />
        <label htmlFor="is_active" className={labelClass}>
          Active (visible to customers)
        </label>
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
          {isSubmitting
            ? 'Saving...'
            : product
            ? 'Update Product'
            : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
