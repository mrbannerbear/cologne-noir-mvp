'use client';

import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types';

interface PaymentSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  bkashTransactionId: string;
  onBkashIdChange: (id: string) => void;
  error?: string;
}

export function PaymentSelector({
  value,
  onChange,
  bkashTransactionId,
  onBkashIdChange,
  error,
}: PaymentSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-wider">Payment Method</p>

      <div className="grid grid-cols-2 gap-4">
        {/* COD Option */}
        <button
          type="button"
          onClick={() => onChange('cod')}
          className={cn(
            'border-2 p-4 text-left transition-colors',
            value === 'cod'
              ? 'border-foreground bg-foreground text-background'
              : 'border-foreground hover:bg-foreground/5'
          )}
        >
          <p className="font-bold uppercase">Cash on Delivery</p>
          <p
            className={cn(
              'mt-1 text-xs',
              value === 'cod' ? 'text-background/80' : 'text-muted-foreground'
            )}
          >
            Pay when you receive your order
          </p>
        </button>

        {/* bKash Option */}
        <button
          type="button"
          onClick={() => onChange('bkash')}
          className={cn(
            'border-2 p-4 text-left transition-colors',
            value === 'bkash'
              ? 'border-foreground bg-foreground text-background'
              : 'border-foreground hover:bg-foreground/5'
          )}
        >
          <p className="font-bold uppercase">bKash</p>
          <p
            className={cn(
              'mt-1 text-xs',
              value === 'bkash' ? 'text-background/80' : 'text-muted-foreground'
            )}
          >
            Pay via bKash mobile payment
          </p>
        </button>
      </div>

      {/* bKash Transaction ID Input */}
      {value === 'bkash' && (
        <div className="space-y-2 border-2 border-foreground p-4">
          <p className="text-sm font-bold">bKash Payment Instructions:</p>
          <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
            <li>Send payment to: 01XXXXXXXXX</li>
            <li>Enter your transaction ID below</li>
            <li>We&apos;ll verify and process your order</li>
          </ol>

          <div className="mt-4">
            <label className="text-xs font-bold uppercase tracking-wider">
              Transaction ID *
            </label>
            <input
              type="text"
              value={bkashTransactionId}
              onChange={(e) => onBkashIdChange(e.target.value)}
              placeholder="Enter bKash transaction ID"
              className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none"
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
