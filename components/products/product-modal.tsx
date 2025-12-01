'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { GSAPModal } from '@/components/shared/gsap-modal';
import { ProductForm } from './product-form';
import { cn, formatCurrency, formatDate, formatNotes } from '@/lib/utils';
import {
  CONCENTRATION_LABELS,
  GENDER_LABELS,
  SEASON_LABELS,
  LOW_STOCK_THRESHOLD,
} from '@/lib/constants';
import { useDeleteProduct } from '@/hooks/use-products';
import type { Product } from '@/types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteProduct = useDeleteProduct();

  if (!product) return null;

  const isLowStock = product.current_volume_ml < LOW_STOCK_THRESHOLD;
  const isOutOfStock = product.current_volume_ml <= 0;

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(product.id);
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  return (
    <GSAPModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : product.name}
      size="lg"
    >
      {isEditing ? (
        <ProductForm
          product={product}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 border-2 border-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 border-2 border-destructive px-4 py-2 text-sm font-medium uppercase tracking-wider text-destructive transition-colors hover:bg-destructive hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

          {/* Stock Warning */}
          {(isLowStock || isOutOfStock) && (
            <div
              className={cn(
                'border-2 p-4',
                isOutOfStock
                  ? 'border-destructive bg-destructive/10'
                  : 'border-foreground bg-foreground/5'
              )}
            >
              <p className="font-bold uppercase">
                {isOutOfStock ? '⚠ Out of Stock' : '⚠ Low Stock Warning'}
              </p>
              <p className="mt-1 text-sm">
                Current volume: {product.current_volume_ml}ml /{' '}
                {product.total_volume_ml}ml
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Brand
              </p>
              <p className="mt-1 font-medium">{product.brand}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Concentration
              </p>
              <p className="mt-1 font-medium">
                {CONCENTRATION_LABELS[product.concentration]}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Gender
              </p>
              <p className="mt-1 font-medium">{GENDER_LABELS[product.gender]}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Season
              </p>
              <p className="mt-1 font-medium">{SEASON_LABELS[product.season]}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Batch Code
              </p>
              <p className="mt-1 font-mono font-medium">
                {product.batch_code || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <p className="mt-1 font-medium">
                {product.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {/* Volume */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Volume
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {product.current_volume_ml}ml / {product.total_volume_ml}ml
                </span>
                <span className="text-sm">
                  {Math.round(
                    (product.current_volume_ml / product.total_volume_ml) * 100
                  )}
                  %
                </span>
              </div>
              <div className="mt-1 h-2 w-full border border-foreground">
                <div
                  className={cn(
                    'h-full',
                    isOutOfStock
                      ? 'bg-destructive'
                      : isLowStock
                      ? 'bg-foreground/60'
                      : 'bg-foreground'
                  )}
                  style={{
                    width: `${Math.min(
                      100,
                      (product.current_volume_ml / product.total_volume_ml) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pricing
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[10, 15, 30, 100].map((size) => {
                const priceKey = `price_${size}ml` as keyof Product;
                const price = product[priceKey] as number | null;
                return (
                  <div key={size} className="border border-foreground/30 p-2 text-center">
                    <p className="text-xs text-muted-foreground">{size}ml</p>
                    <p className="font-mono font-bold">
                      {price !== null ? formatCurrency(price) : '-'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Top Notes
              </p>
              <p className="mt-1 text-sm">{formatNotes(product.top_notes)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Heart Notes
              </p>
              <p className="mt-1 text-sm">{formatNotes(product.heart_notes)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Base Notes
              </p>
              <p className="mt-1 text-sm">{formatNotes(product.base_notes)}</p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </p>
              <p className="mt-1 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Meta */}
          <div className="border-t border-foreground/20 pt-4 text-xs text-muted-foreground">
            <p>Created: {formatDate(product.created_at)}</p>
            <p>Updated: {formatDate(product.updated_at)}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 p-4">
          <div className="max-w-sm space-y-4 border-2 border-destructive bg-background p-6">
            <h3 className="font-serif text-lg font-bold">Delete Product?</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete &quot;{product.name}&quot;? This action
              cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border-2 border-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProduct.isPending}
                className="flex-1 border-2 border-destructive bg-destructive px-4 py-2 text-sm font-medium uppercase tracking-wider text-white disabled:opacity-50"
              >
                {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </GSAPModal>
  );
}
