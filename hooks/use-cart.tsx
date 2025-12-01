'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import type { Cart, CartItem, SizeOption } from '@/types';
import { SHIPPING_COST } from '@/lib/constants';

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; sizeValue: number } }
  | {
      type: 'UPDATE_QUANTITY';
      payload: { productId: string; sizeValue: number; quantity: number };
    }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const CART_STORAGE_KEY = 'cologne-noir-cart';

function calculateTotals(items: CartItem[]): Omit<Cart, 'items'> {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const shippingCost = items.length > 0 ? SHIPPING_COST : 0;
  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
  };
}

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === action.payload.productId &&
          item.sizeValue === action.payload.sizeValue
      );

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }

      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.sizeValue === action.payload.sizeValue
          )
      );
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const newItems = state.items.filter(
          (item) =>
            !(
              item.productId === action.payload.productId &&
              item.sizeValue === action.payload.sizeValue
            )
        );
        return { ...state, items: newItems, ...calculateTotals(newItems) };
      }

      const newItems = state.items.map((item) =>
        item.productId === action.payload.productId &&
        item.sizeValue === action.payload.sizeValue
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }

    case 'CLEAR_CART':
      return { items: [], subtotal: 0, shippingCost: 0, total: 0 };

    case 'LOAD_CART':
      return {
        items: action.payload,
        ...calculateTotals(action.payload),
      };

    default:
      return state;
  }
}

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  shippingCost: 0,
  total: 0,
};

interface CartContextType {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, sizeValue: SizeOption) => void;
  updateQuantity: (
    productId: string,
    sizeValue: SizeOption,
    quantity: number
  ) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        const items = JSON.parse(saved) as CartItem[];
        dispatch({ type: 'LOAD_CART', payload: items });
      } catch {
        // Invalid cart data, ignore
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
  }, [cart.items]);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (productId: string, sizeValue: SizeOption) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, sizeValue } });
  };

  const updateQuantity = (
    productId: string,
    sizeValue: SizeOption,
    quantity: number
  ) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, sizeValue, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
