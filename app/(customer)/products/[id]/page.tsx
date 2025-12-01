'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { SizeSelector } from '@/components/products/size-selector';
import { NotesDisplay } from '@/components/products/notes-display';
import { LoadingPage } from '@/components/shared/loading-spinner';
import { useProduct } from '@/hooks/use-products';
import { useCart } from '@/hooks/use-cart';
import { cn, formatCurrency, getStockStatus, getPriceForSize } from '@/lib/utils';
import { CONCENTRATION_LABELS, GENDER_LABELS, SEASON_LABELS } from '@/lib/constants';
import type { SizeOption } from '@/types';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: product, isLoading } = useProduct(id);
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!product) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold">Product Not Found</h2>
          <Link href="/products" className="mt-4 inline-block underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.current_volume_ml);
  const selectedPrice = selectedSize ? getPriceForSize(product, selectedSize) : null;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedPrice) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productBrand: product.brand,
      imageUrl: product.image_url,
      sizeValue: selectedSize,
      quantity,
      unitPrice: selectedPrice,
      batchCode: product.batch_code,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Back Link */}
      <div className="border-b border-foreground/20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </div>
      </div>

      {/* Product Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square border-2 border-foreground bg-muted">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-serif text-8xl font-bold text-muted-foreground/30">
                  {product.brand.charAt(0)}
                </span>
              </div>
            )}

            {/* Stock Badge */}
            {stockStatus !== 'in_stock' && (
              <div
                className={cn(
                  'absolute right-0 top-0 px-4 py-2 text-sm font-bold uppercase tracking-wider',
                  stockStatus === 'low_stock'
                    ? 'bg-foreground text-background'
                    : 'bg-destructive text-white'
                )}
              >
                {stockStatus === 'low_stock' ? 'Low Stock' : 'Sold Out'}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {product.brand}
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold">{product.name}</h1>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="border-2 border-foreground px-3 py-1 text-sm font-medium uppercase tracking-wider">
                {CONCENTRATION_LABELS[product.concentration]}
              </span>
              <span className="border-2 border-foreground px-3 py-1 text-sm font-medium uppercase tracking-wider">
                {GENDER_LABELS[product.gender]}
              </span>
              {product.season !== 'all' && (
                <span className="border-2 border-foreground px-3 py-1 text-sm font-medium uppercase tracking-wider">
                  {SEASON_LABELS[product.season]}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            {/* Notes */}
            <NotesDisplay
              topNotes={product.top_notes}
              heartNotes={product.heart_notes}
              baseNotes={product.base_notes}
            />

            {/* Size Selector */}
            <SizeSelector
              product={product}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
            />

            {/* Quantity */}
            {selectedSize && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Quantity</p>
                <div className="mt-2 flex items-center border-2 border-foreground">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 transition-opacity hover:opacity-60"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-mono font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-2 transition-opacity hover:opacity-60"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Price & Add to Cart */}
            <div className="border-t border-foreground/20 pt-6">
              {selectedPrice !== null && (
                <p className="mb-4 font-serif text-3xl font-bold">
                  {formatCurrency(selectedPrice * quantity)}
                </p>
              )}
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || stockStatus === 'out_of_stock'}
                className={cn(
                  'flex w-full items-center justify-center gap-2 border-2 py-4 font-medium uppercase tracking-wider transition-colors',
                  addedToCart
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-foreground hover:bg-foreground hover:text-background',
                  (!selectedSize || stockStatus === 'out_of_stock') &&
                    'cursor-not-allowed opacity-50'
                )}
              >
                <ShoppingBag className="h-5 w-5" />
                {addedToCart
                  ? 'Added to Cart!'
                  : stockStatus === 'out_of_stock'
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
            </div>

            {/* Batch Info */}
            {product.batch_code && (
              <div className="text-xs text-muted-foreground">
                <p>Batch Code: {product.batch_code}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
