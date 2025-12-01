'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { ProductGrid } from '@/components/products/product-grid';
import { LoadingPage } from '@/components/shared/loading-spinner';
import { useProducts, useBrands } from '@/hooks/use-products';
import { CONCENTRATION_LABELS, GENDER_LABELS, SEASON_LABELS } from '@/lib/constants';
import type { ProductFilters } from '@/types';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Build filters from URL params
  const [filters, setFilters] = useState<ProductFilters>({
    brand: searchParams.get('brand') || undefined,
    gender: searchParams.get('gender') || undefined,
    concentration: searchParams.get('concentration') || undefined,
    season: searchParams.get('season') || undefined,
    search: searchParams.get('search') || undefined,
  });

  const { data: products, isLoading } = useProducts(filters);
  const { data: brands } = useBrands();

  const updateFilter = (key: keyof ProductFilters, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold uppercase tracking-wider">
            Shop
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse our collection of premium fragrance decants
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:flex lg:gap-8">
          {/* Mobile Filter Toggle */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border-2 border-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } mb-8 lg:block lg:w-64 lg:flex-shrink-0`}
          >
            <div className="space-y-6 border-2 border-foreground p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold uppercase tracking-wider">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) =>
                    updateFilter('search', e.target.value || undefined)
                  }
                  placeholder="Search..."
                  className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider">
                  Brand
                </label>
                <select
                  value={filters.brand || ''}
                  onChange={(e) =>
                    updateFilter('brand', e.target.value || undefined)
                  }
                  className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">All Brands</option>
                  {brands?.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Concentration */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider">
                  Concentration
                </label>
                <select
                  value={filters.concentration || ''}
                  onChange={(e) =>
                    updateFilter('concentration', e.target.value || undefined)
                  }
                  className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">All Types</option>
                  {Object.entries(CONCENTRATION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider">
                  Gender
                </label>
                <select
                  value={filters.gender || ''}
                  onChange={(e) =>
                    updateFilter('gender', e.target.value || undefined)
                  }
                  className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">All</option>
                  {Object.entries(GENDER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider">
                  Season
                </label>
                <select
                  value={filters.season || ''}
                  onChange={(e) =>
                    updateFilter('season', e.target.value || undefined)
                  }
                  className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">All Seasons</option>
                  {Object.entries(SEASON_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {products?.length || 0} products found
              </p>
            </div>

            {/* Grid */}
            {isLoading ? (
              <LoadingPage />
            ) : (
              <ProductGrid
                products={products || []}
                emptyMessage="No products found matching your criteria"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
