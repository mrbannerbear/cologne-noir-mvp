'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn, formatCurrency, getStockStatus } from '@/lib/utils';
import type { Product } from '@/types';
import { GENDER_LABELS, SEASON_LABELS, SIZE_OPTIONS, SIZE_PRICE_FIELDS } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const stockStatus = getStockStatus(product.current_volume_ml);

  // Get lowest available price
  const prices = SIZE_OPTIONS.map((size) => {
    const priceField = SIZE_PRICE_FIELDS[size] as keyof Product;
    return product[priceField] as number | null;
  }).filter((p): p is number => p !== null);

  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        'group block border-2 border-foreground bg-background transition-transform hover:-translate-y-1',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden border-b-2 border-foreground bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-4xl font-bold text-muted-foreground/30">
              {product.brand.charAt(0)}
            </span>
          </div>
        )}

        {/* Stock Badge */}
        {stockStatus !== 'in_stock' && (
          <div
            className={cn(
              'absolute right-0 top-0 px-3 py-1 text-xs font-bold uppercase tracking-wider',
              stockStatus === 'low_stock'
                ? 'bg-foreground text-background'
                : 'bg-destructive text-white'
            )}
          >
            {stockStatus === 'low_stock' ? 'Low Stock' : 'Sold Out'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.brand}
        </p>

        {/* Name */}
        <h3 className="mt-1 font-serif text-lg font-bold leading-tight">
          {product.name}
        </h3>

        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="border border-foreground/30 px-2 py-0.5 text-xs uppercase tracking-wider">
            {product.concentration}
          </span>
          <span className="border border-foreground/30 px-2 py-0.5 text-xs uppercase tracking-wider">
            {GENDER_LABELS[product.gender]}
          </span>
          {product.season !== 'all' && (
            <span className="border border-foreground/30 px-2 py-0.5 text-xs uppercase tracking-wider">
              {SEASON_LABELS[product.season]}
            </span>
          )}
        </div>

        {/* Price */}
        {lowestPrice !== null && (
          <p className="mt-3 font-serif text-xl font-bold">
            From {formatCurrency(lowestPrice)}
          </p>
        )}
      </div>
    </Link>
  );
}
