'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { useCart } from '@/hooks/use-cart';

export default function CartPage() {
  const { cart, itemCount, clearCart } = useCart();

  if (itemCount === 0) {
    return (
      <div className="min-h-screen">
        <div className="border-b-2 border-foreground">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="font-serif text-4xl font-bold uppercase tracking-wider">
              Your Cart
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center border-2 border-foreground">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-2xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Link
              href="/products"
              className="mt-8 border-2 border-foreground bg-foreground px-8 py-3 font-medium uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b-2 border-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-4xl font-bold uppercase tracking-wider">
              Your Cart
            </h1>
            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground underline transition-colors hover:text-foreground"
            >
              Clear cart
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.sizeValue}`}
                  item={item}
                />
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-8">
              <Link
                href="/products"
                className="text-sm text-muted-foreground underline transition-colors hover:text-foreground"
              >
                ← Continue shopping
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
