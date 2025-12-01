'use client';

import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import type { CartItem as CartItemType, SizeOption } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart();

  return (
    <div className="flex gap-4 border-2 border-foreground p-4">
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0 border border-foreground/30 bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-xl font-bold text-muted-foreground/30">
              {item.productBrand.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {item.productBrand}
          </p>
          <h3 className="font-serif text-lg font-bold">{item.productName}</h3>
          <p className="text-sm text-muted-foreground">{item.sizeValue}ml</p>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center border-2 border-foreground">
            <button
              onClick={() =>
                updateQuantity(
                  item.productId,
                  item.sizeValue as SizeOption,
                  item.quantity - 1
                )
              }
              className="p-2 transition-opacity hover:opacity-60"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-mono text-sm font-bold">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                updateQuantity(
                  item.productId,
                  item.sizeValue as SizeOption,
                  item.quantity + 1
                )
              }
              className="p-2 transition-opacity hover:opacity-60"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Price */}
          <p className="font-mono text-lg font-bold">
            {formatCurrency(item.unitPrice * item.quantity)}
          </p>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeItem(item.productId, item.sizeValue as SizeOption)}
        className="self-start p-1 transition-opacity hover:opacity-60"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
