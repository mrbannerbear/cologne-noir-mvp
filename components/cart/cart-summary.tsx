'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
}

export function CartSummary({ showCheckoutButton = true }: CartSummaryProps) {
  const { cart, itemCount } = useCart();

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="border-2 border-foreground p-6">
      <h3 className="font-serif text-xl font-bold">Order Summary</h3>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} items)
          </span>
          <span className="font-mono">{formatCurrency(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-mono">
            {cart.shippingCost > 0 ? formatCurrency(cart.shippingCost) : 'Free'}
          </span>
        </div>
        <div className="border-t border-foreground/20 pt-3">
          <div className="flex justify-between">
            <span className="font-bold uppercase tracking-wider">Total</span>
            <span className="font-serif text-2xl font-bold">
              {formatCurrency(cart.total)}
            </span>
          </div>
        </div>
      </div>

      {showCheckoutButton && (
        <Link
          href="/checkout"
          className="mt-6 block w-full border-2 border-foreground bg-foreground py-3 text-center font-medium uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground"
        >
          Proceed to Checkout
        </Link>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Cash on Delivery & bKash accepted
      </p>
    </div>
  );
}
