'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { useCustomers } from '@/hooks/use-customers';
import { useAdminProducts } from '@/hooks/use-products';
import { useAdminCreateOrder } from '@/hooks/use-create-order';
import { formatCurrency } from '@/lib/utils';
import { SIZE_OPTIONS, SHIPPING_COST } from '@/lib/constants';
import type { Product } from '@/types';

const orderSchema = z.object({
  user_id: z.string().min(1, 'Customer is required'),
  payment_method: z.enum(['cod', 'bkash']),
  bkash_transaction_id: z.string().optional(),
  shipping_address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
  }),
  notes: z.string().optional(),
  shipping_cost: z.number().min(0),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderItem {
  product_id: string;
  product_name: string;
  product_brand: string;
  batch_code: string | null;
  size_value: number;
  unit_price: number;
  quantity: number;
}

interface CreateOrderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateOrderForm({ onSuccess, onCancel }: CreateOrderFormProps) {
  const { data: customers } = useCustomers();
  const { data: products } = useAdminProducts();
  const createOrder = useAdminCreateOrder();
  
  const [error, setError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSize, setSelectedSize] = useState<number>(10);
  const [quantity, setQuantity] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      user_id: '',
      payment_method: 'cod',
      bkash_transaction_id: '',
      shipping_address: {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Bangladesh',
      },
      notes: '',
      shipping_cost: SHIPPING_COST,
    },
  });

  const paymentMethod = watch('payment_method');
  const selectedUserId = watch('user_id');
  const shippingCost = watch('shipping_cost') || 0;

  // Auto-fill shipping address when customer is selected
  const selectedCustomer = useMemo(() => {
    return customers?.find((c) => c.id === selectedUserId);
  }, [customers, selectedUserId]);

  const handleCustomerChange = (customerId: string) => {
    setValue('user_id', customerId);
    const customer = customers?.find((c) => c.id === customerId);
    if (customer?.shipping_address) {
      setValue('shipping_address', {
        street: customer.shipping_address.street || '',
        city: customer.shipping_address.city || '',
        state: customer.shipping_address.state || '',
        postal_code: customer.shipping_address.postal_code || '',
        country: customer.shipping_address.country || 'Bangladesh',
      });
    }
  };

  // Get price for selected product and size
  const getPrice = (product: Product, size: number): number | null => {
    switch (size) {
      case 10: return product.price_10ml;
      case 15: return product.price_15ml;
      case 30: return product.price_30ml;
      case 100: return product.price_100ml;
      default: return null;
    }
  };

  // Add item to order
  const addItem = () => {
    const product = products?.find((p) => p.id === selectedProductId);
    if (!product) return;

    const price = getPrice(product, selectedSize);
    if (price === null) {
      setError('This size is not available for the selected product');
      return;
    }

    // Check if item already exists with same product and size
    const existingIndex = orderItems.findIndex(
      (item) => item.product_id === selectedProductId && item.size_value === selectedSize
    );

    if (existingIndex >= 0) {
      // Update quantity
      const updated = [...orderItems];
      updated[existingIndex].quantity += quantity;
      setOrderItems(updated);
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          product_id: product.id,
          product_name: product.name,
          product_brand: product.brand,
          batch_code: product.batch_code,
          size_value: selectedSize,
          unit_price: price,
          quantity,
        },
      ]);
    }

    // Reset selection
    setSelectedProductId('');
    setQuantity(1);
    setError(null);
  };

  // Remove item from order
  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const total = subtotal + shippingCost;

  const onSubmit = async (data: OrderFormData) => {
    if (orderItems.length === 0) {
      setError('Please add at least one product to the order');
      return;
    }

    setError(null);
    try {
      await createOrder.mutateAsync({
        user_id: data.user_id,
        payment_method: data.payment_method,
        bkash_transaction_id: data.bkash_transaction_id,
        subtotal,
        shipping_cost: shippingCost,
        total,
        shipping_address: data.shipping_address,
        notes: data.notes,
        items: orderItems,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    }
  };

  const inputClass =
    'w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-0';
  const labelClass = 'text-xs font-bold uppercase tracking-wider';
  const errorClass = 'mt-1 text-xs text-destructive';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Selection */}
      <div>
        <label className={labelClass}>Customer *</label>
        <select
          value={selectedUserId}
          onChange={(e) => handleCustomerChange(e.target.value)}
          className={inputClass}
        >
          <option value="">Select a customer</option>
          {customers?.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.full_name || customer.email} - {customer.phone || 'No phone'}
            </option>
          ))}
        </select>
        {errors.user_id && <p className={errorClass}>{errors.user_id.message}</p>}
        {selectedCustomer && (
          <p className="mt-1 text-xs text-muted-foreground">
            Email: {selectedCustomer.email}
          </p>
        )}
      </div>

      {/* Product Selection */}
      <div className="border-2 border-foreground/30 p-4">
        <label className={labelClass}>Add Products</label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          <div className="col-span-2">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select product</option>
              {products?.filter(p => p.is_active).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.brand} - {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(Number(e.target.value))}
              className={inputClass}
            >
              {SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}ml
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={inputClass}
              placeholder="Qty"
            />
            <button
              type="button"
              onClick={addItem}
              disabled={!selectedProductId}
              className="border-2 border-foreground bg-foreground px-3 text-background disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Items */}
      {orderItems.length > 0 && (
        <div className="border-2 border-foreground">
          <div className="border-b border-foreground bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider text-background">
            Order Items
          </div>
          <div className="divide-y divide-foreground/20">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3">
                <div>
                  <p className="font-medium">
                    {item.product_brand} - {item.product_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.size_value}ml × {item.quantity} @ {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-mono font-bold">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-destructive hover:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div>
        <label className={labelClass}>Payment Method *</label>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              {...register('payment_method')}
              type="radio"
              value="cod"
              className="h-4 w-4 border-2 border-foreground"
            />
            <span className="text-sm">Cash on Delivery</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              {...register('payment_method')}
              type="radio"
              value="bkash"
              className="h-4 w-4 border-2 border-foreground"
            />
            <span className="text-sm">bKash</span>
          </label>
        </div>
      </div>

      {/* bKash Transaction ID */}
      {paymentMethod === 'bkash' && (
        <div>
          <label className={labelClass}>bKash Transaction ID</label>
          <input
            {...register('bkash_transaction_id')}
            className={inputClass}
            placeholder="Transaction ID (optional)"
          />
        </div>
      )}

      {/* Shipping Address */}
      <div>
        <label className={labelClass}>Shipping Address</label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <input
              {...register('shipping_address.street')}
              className={inputClass}
              placeholder="Street address"
            />
          </div>
          <div>
            <input
              {...register('shipping_address.city')}
              className={inputClass}
              placeholder="City"
            />
          </div>
          <div>
            <input
              {...register('shipping_address.state')}
              className={inputClass}
              placeholder="State/Division"
            />
          </div>
          <div>
            <input
              {...register('shipping_address.postal_code')}
              className={inputClass}
              placeholder="Postal code"
            />
          </div>
          <div>
            <input
              {...register('shipping_address.country')}
              className={inputClass}
              placeholder="Country"
            />
          </div>
        </div>
      </div>

      {/* Shipping Cost */}
      <div>
        <label className={labelClass}>Shipping Cost (BDT)</label>
        <input
          {...register('shipping_cost', { valueAsNumber: true })}
          type="number"
          min="0"
          step="1"
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Order Notes</label>
        <textarea
          {...register('notes')}
          className={`${inputClass} min-h-[60px] resize-none`}
          placeholder="Optional notes"
        />
      </div>

      {/* Totals */}
      <div className="border-2 border-foreground bg-foreground/5 p-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-mono">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span className="font-mono">{formatCurrency(shippingCost)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-foreground/20 pt-2 font-bold">
          <span>Total</span>
          <span className="font-mono text-lg">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="border-2 border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t border-foreground/20 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border-2 border-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || orderItems.length === 0}
          className="flex-1 border-2 border-foreground bg-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider text-background disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}
