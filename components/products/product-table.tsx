'use client';

import { cn, formatCurrency } from '@/lib/utils';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import type { Product } from '@/types';
import { CONCENTRATION_LABELS, GENDER_LABELS, SEASON_LABELS } from '@/lib/constants';

interface ProductTableProps {
  products: Product[];
  onRowClick?: (product: Product) => void;
}

export function ProductTable({ products, onRowClick }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center border-2 border-dashed border-foreground/30">
        <p className="text-sm text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-2 border-foreground">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-foreground bg-foreground text-background">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Brand
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Gender
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Season
            </th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
              Stock (ml)
            </th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
              10ml Price
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isLowStock = product.current_volume_ml < LOW_STOCK_THRESHOLD;
            const isOutOfStock = product.current_volume_ml <= 0;

            return (
              <tr
                key={product.id}
                onClick={() => onRowClick?.(product)}
                className={cn(
                  'border-b border-foreground/20 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-muted/50',
                  isLowStock && 'bg-destructive/10',
                  isOutOfStock && 'bg-destructive/20'
                )}
              >
                <td className="px-4 py-3">
                  <span className="font-medium">{product.name}</span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {product.brand}
                </td>
                <td className="px-4 py-3 text-sm">
                  {CONCENTRATION_LABELS[product.concentration]}
                </td>
                <td className="px-4 py-3 text-sm">
                  {GENDER_LABELS[product.gender]}
                </td>
                <td className="px-4 py-3 text-sm">
                  {SEASON_LABELS[product.season]}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      'font-mono text-sm',
                      isLowStock && 'font-bold text-destructive'
                    )}
                  >
                    {product.current_volume_ml} / {product.total_volume_ml}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  {product.price_10ml ? formatCurrency(product.price_10ml) : '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={cn(
                      'inline-block px-2 py-1 text-xs font-bold uppercase',
                      product.is_active
                        ? 'border border-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
