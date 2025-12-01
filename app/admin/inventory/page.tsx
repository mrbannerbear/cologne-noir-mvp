'use client';

import { useState } from 'react';
import { StockHealthTable } from '@/components/admin/stock-health-table';
import { VolumeAdjustmentForm } from '@/components/admin/volume-adjustment-form';
import { GSAPModal } from '@/components/shared/gsap-modal';
import { LoadingPage } from '@/components/shared/loading-spinner';
import { useAdminProducts } from '@/hooks/use-products';
import { cn } from '@/lib/utils';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import type { Product } from '@/types';

export default function AdminInventoryPage() {
  const { data: products, isLoading } = useAdminProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterLowStock, setFilterLowStock] = useState(false);

  if (isLoading) {
    return <LoadingPage />;
  }

  const activeProducts = products?.filter((p) => p.is_active) || [];
  const lowStockProducts = activeProducts.filter(
    (p) => p.current_volume_ml < LOW_STOCK_THRESHOLD
  );
  const outOfStockProducts = activeProducts.filter(
    (p) => p.current_volume_ml <= 0
  );

  const displayProducts = filterLowStock ? lowStockProducts : activeProducts;

  // Calculate total volume
  const totalVolume = activeProducts.reduce(
    (sum, p) => sum + p.current_volume_ml,
    0
  );
  const totalCapacity = activeProducts.reduce(
    (sum, p) => sum + p.total_volume_ml,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold uppercase tracking-wider">
          Inventory
        </h1>
        <p className="mt-2 text-muted-foreground">
          Monitor and adjust your fragrance stock levels
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="border-2 border-foreground p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Total Volume
          </p>
          <p className="mt-2 font-serif text-2xl font-bold">
            {totalVolume.toFixed(0)}ml
          </p>
          <p className="text-xs text-muted-foreground">
            of {totalCapacity.toFixed(0)}ml capacity
          </p>
        </div>
        <div className="border-2 border-foreground p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Active Products
          </p>
          <p className="mt-2 font-serif text-2xl font-bold">
            {activeProducts.length}
          </p>
        </div>
        <div
          className={cn(
            'border-2 border-foreground p-4',
            lowStockProducts.length > 0 && 'bg-destructive/10'
          )}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Low Stock
          </p>
          <p
            className={cn(
              'mt-2 font-serif text-2xl font-bold',
              lowStockProducts.length > 0 && 'text-destructive'
            )}
          >
            {lowStockProducts.length}
          </p>
        </div>
        <div
          className={cn(
            'border-2 border-foreground p-4',
            outOfStockProducts.length > 0 && 'bg-destructive/20'
          )}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Out of Stock
          </p>
          <p
            className={cn(
              'mt-2 font-serif text-2xl font-bold',
              outOfStockProducts.length > 0 && 'text-destructive'
            )}
          >
            {outOfStockProducts.length}
          </p>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setFilterLowStock(false)}
          className={cn(
            'border-2 border-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider',
            !filterLowStock && 'bg-foreground text-background'
          )}
        >
          All Products
        </button>
        <button
          onClick={() => setFilterLowStock(true)}
          className={cn(
            'border-2 border-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider',
            filterLowStock && 'bg-foreground text-background'
          )}
        >
          Low Stock Only ({lowStockProducts.length})
        </button>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto border-2 border-foreground">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-foreground bg-foreground text-background">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                Brand
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
                Current
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
                %
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {displayProducts.map((product) => {
              const percent = Math.round(
                (product.current_volume_ml / product.total_volume_ml) * 100
              );
              const isLowStock = product.current_volume_ml < LOW_STOCK_THRESHOLD;
              const isOutOfStock = product.current_volume_ml <= 0;

              return (
                <tr
                  key={product.id}
                  className={cn(
                    'border-b border-foreground/20',
                    isOutOfStock && 'bg-destructive/20',
                    isLowStock && !isOutOfStock && 'bg-destructive/10'
                  )}
                >
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.brand}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span
                      className={cn(
                        isLowStock && 'font-bold text-destructive'
                      )}
                    >
                      {product.current_volume_ml}ml
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                    {product.total_volume_ml}ml
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-2 w-16 border border-foreground/30">
                        <div
                          className={cn(
                            'h-full',
                            isOutOfStock
                              ? 'bg-destructive'
                              : isLowStock
                              ? 'bg-destructive/70'
                              : 'bg-foreground'
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm">{percent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="border border-foreground px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Volume Adjustment Modal */}
      <GSAPModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={`Adjust Volume: ${selectedProduct?.name}`}
        size="md"
      >
        {selectedProduct && (
          <VolumeAdjustmentForm
            product={selectedProduct}
            onSuccess={() => setSelectedProduct(null)}
            onCancel={() => setSelectedProduct(null)}
          />
        )}
      </GSAPModal>
    </div>
  );
}
