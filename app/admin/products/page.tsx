'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ProductTable } from '@/components/products/product-table';
import { ProductModal } from '@/components/products/product-modal';
import { ProductForm } from '@/components/products/product-form';
import { GSAPModal } from '@/components/shared/gsap-modal';
import { LoadingPage } from '@/components/shared/loading-spinner';
import { useAdminProducts } from '@/hooks/use-products';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const { data: products, isLoading } = useAdminProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading) {
    return <LoadingPage />;
  }

  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-wider">
            Products
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your fragrance inventory
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 border-2 border-foreground bg-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider text-background"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-2 border-foreground p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Total Products
          </p>
          <p className="mt-2 font-serif text-3xl font-bold">{products?.length || 0}</p>
        </div>
        <div className="border-2 border-foreground p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Active
          </p>
          <p className="mt-2 font-serif text-3xl font-bold">
            {products?.filter((p) => p.is_active).length || 0}
          </p>
        </div>
        <div className="border-2 border-foreground bg-destructive/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Low Stock
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-destructive">
            {products?.filter((p) => p.current_volume_ml < 10 && p.is_active).length || 0}
          </p>
        </div>
      </div>

      {/* Table */}
      <ProductTable products={products || []} onRowClick={handleRowClick} />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Add Product Modal */}
      <GSAPModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
        size="lg"
      >
        <ProductForm onSuccess={handleAddSuccess} onCancel={() => setShowAddModal(false)} />
      </GSAPModal>
    </div>
  );
}
