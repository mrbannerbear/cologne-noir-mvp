'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  volumeAdjustmentSchema,
  type VolumeAdjustmentFormData,
} from '@/lib/validations/product';
import { ADJUSTMENT_REASON_LABELS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { Product } from '@/types';

interface VolumeAdjustmentFormProps {
  product: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VolumeAdjustmentForm({
  product,
  onSuccess,
  onCancel,
}: VolumeAdjustmentFormProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VolumeAdjustmentFormData>({
    resolver: zodResolver(volumeAdjustmentSchema),
    defaultValues: {
      product_id: product.id,
      new_volume: product.current_volume_ml,
      reason: 'correction',
      notes: '',
    },
  });

  const newVolume = watch('new_volume');
  const adjustment = newVolume - product.current_volume_ml;

  const onSubmit = async (data: VolumeAdjustmentFormData) => {
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Not authenticated');
        return;
      }

      const { data: result, error: rpcError } = await supabase.rpc(
        'adjust_product_volume',
        {
          p_product_id: data.product_id,
          p_admin_id: user.id,
          p_new_volume: data.new_volume,
          p_reason: data.reason,
          p_notes: data.notes || null,
        }
      );

      if (rpcError) throw rpcError;
      if (!result.success) throw new Error(result.error);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', product.id] });

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust volume');
    }
  };

  const inputClass =
    'w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-0';
  const labelClass = 'text-xs font-bold uppercase tracking-wider';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Volume Display */}
      <div className="border-2 border-foreground p-4">
        <p className={labelClass}>Current Volume</p>
        <p className="mt-2 font-mono text-2xl font-bold">
          {product.current_volume_ml}ml
        </p>
        <p className="text-xs text-muted-foreground">
          of {product.total_volume_ml}ml total
        </p>
      </div>

      {/* New Volume */}
      <div>
        <label className={labelClass}>New Volume (ml) *</label>
        <input
          {...register('new_volume')}
          type="number"
          step="0.01"
          min="0"
          max={product.total_volume_ml}
          className={inputClass}
        />
        {errors.new_volume && (
          <p className="mt-1 text-xs text-destructive">
            {errors.new_volume.message}
          </p>
        )}
      </div>

      {/* Adjustment Preview */}
      <div className="border-2 border-foreground/30 p-4">
        <p className={labelClass}>Adjustment</p>
        <p
          className={`mt-2 font-mono text-xl font-bold ${
            adjustment > 0
              ? 'text-green-600'
              : adjustment < 0
              ? 'text-destructive'
              : ''
          }`}
        >
          {adjustment > 0 ? '+' : ''}
          {adjustment}ml
        </p>
      </div>

      {/* Reason */}
      <div>
        <label className={labelClass}>Reason *</label>
        <select {...register('reason')} className={inputClass}>
          {Object.entries(ADJUSTMENT_REASON_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.reason && (
          <p className="mt-1 text-xs text-destructive">{errors.reason.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          {...register('notes')}
          className={`${inputClass} min-h-[80px] resize-none`}
          placeholder="Optional notes about this adjustment"
        />
        {errors.notes && (
          <p className="mt-1 text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="border-2 border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

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
          disabled={isSubmitting || adjustment === 0}
          className="flex-1 border-2 border-foreground bg-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider text-background disabled:opacity-50"
        >
          {isSubmitting ? 'Adjusting...' : 'Adjust Volume'}
        </button>
      </div>
    </form>
  );
}
