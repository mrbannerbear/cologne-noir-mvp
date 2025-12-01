// Re-export all types from database
export * from './database';

// Cart types
export interface CartItem {
  productId: string;
  productName: string;
  productBrand: string;
  imageUrl: string | null;
  sizeValue: number;
  quantity: number;
  unitPrice: number;
  batchCode: string | null;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

// Size options
export type SizeOption = 10 | 15 | 30 | 100;

export interface SizePricing {
  size: SizeOption;
  price: number | null;
  available: boolean;
}

// Filter types
export interface ProductFilters {
  brand?: string;
  concentration?: string;
  gender?: string;
  season?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Form types
export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  paymentMethod: 'cod' | 'bkash';
  bkashTransactionId?: string;
  notes?: string;
}
