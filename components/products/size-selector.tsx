'use client';

import { cn, formatCurrency } from '@/lib/utils';
import { SIZE_OPTIONS, SIZE_PRICE_FIELDS } from '@/lib/constants';
import type { Product, SizeOption } from '@/types';

interface SizeSelectorProps {
  product: Product;
  selectedSize: SizeOption | null;
  onSizeChange: (size: SizeOption) => void;
}

export function SizeSelector({
  product,
  selectedSize,
  onSizeChange,
}: SizeSelectorProps) {
  const getPrice = (size: SizeOption): number | null => {
    const priceField = SIZE_PRICE_FIELDS[size] as keyof Product;
    return product[priceField] as number | null;
  };

  const isAvailable = (size: SizeOption): boolean => {
    const price = getPrice(size);
    return price !== null && product.current_volume_ml >= size;
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider">Select Size</p>
      <div className="grid grid-cols-4 gap-2">
        {SIZE_OPTIONS.map((size) => {
          const price = getPrice(size);
          const available = isAvailable(size);

          return (
            <button
              key={size}
              onClick={() => available && onSizeChange(size)}
              disabled={!available}
              className={cn(
                'border-2 p-3 text-center transition-colors',
                selectedSize === size
                  ? 'border-foreground bg-foreground text-background'
                  : available
                  ? 'border-foreground hover:bg-foreground/10'
                  : 'border-foreground/30 text-muted-foreground cursor-not-allowed'
              )}
            >
              <p className="text-sm font-bold">{size}ml</p>
              <p
                className={cn(
                  'mt-1 text-xs',
                  selectedSize === size
                    ? 'text-background/80'
                    : 'text-muted-foreground'
                )}
              >
                {price !== null ? formatCurrency(price) : 'N/A'}
              </p>
            </button>
          );
        })}
      </div>
      {selectedSize && (
        <p className="mt-2 text-sm text-muted-foreground">
          Volume remaining: {product.current_volume_ml}ml
        </p>
      )}
    </div>
  );
}
