'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface StockHealthTableProps {
  products: Product[];
  threshold?: number;
}

export function StockHealthTable({ products, threshold = 10 }: StockHealthTableProps) {
  // Sort by stock level (lowest first)
  const sortedProducts = [...products].sort(
    (a, b) => a.current_volume_ml - b.current_volume_ml
  );

  if (sortedProducts.length === 0) {
    return (
      <div className="border-2 border-foreground p-8 text-center">
        <p className="text-sm text-muted-foreground">All products have sufficient stock</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground">
      <div className="border-b-2 border-foreground bg-foreground p-4 text-background">
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Low Stock Alert ({sortedProducts.length} products)
        </h3>
      </div>

      <div className="divide-y divide-foreground/20">
        {sortedProducts.map((product) => {
          const percentRemaining = Math.round(
            (product.current_volume_ml / product.total_volume_ml) * 100
          );
          const isOutOfStock = product.current_volume_ml <= 0;
          const isCritical = product.current_volume_ml < threshold / 2;

          return (
            <Link
              key={product.id}
              href={`/admin/products?id=${product.id}`}
              className={cn(
                'block p-4 transition-colors hover:bg-muted/50',
                isOutOfStock && 'bg-destructive/20',
                isCritical && !isOutOfStock && 'bg-destructive/10'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                </div>
                <div className="ml-4 text-right">
                  <p
                    className={cn(
                      'font-mono text-lg font-bold',
                      isOutOfStock && 'text-destructive',
                      isCritical && !isOutOfStock && 'text-destructive'
                    )}
                  >
                    {product.current_volume_ml}ml
                  </p>
                  <p className="text-xs text-muted-foreground">
                    of {product.total_volume_ml}ml
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2">
                <div className="h-2 w-full border border-foreground/30">
                  <div
                    className={cn(
                      'h-full',
                      isOutOfStock
                        ? 'bg-destructive'
                        : isCritical
                        ? 'bg-destructive/70'
                        : 'bg-foreground/60'
                    )}
                    style={{ width: `${percentRemaining}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {percentRemaining}% remaining
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
