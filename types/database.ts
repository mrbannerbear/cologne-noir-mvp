// Database Types for Cologne Noir MVP
// Auto-generated from Supabase schema

export type UserRole = 'admin' | 'customer';
export type ConcentrationType = 'EDT' | 'EDP' | 'Extrait' | 'Parfum' | 'Cologne';
export type GenderType = 'masculine' | 'feminine' | 'unisex';
export type SeasonType = 'spring' | 'summer' | 'fall' | 'winter' | 'all';
export type OrderStatus = 'pending_payment' | 'new' | 'decanting' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'bkash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type AdjustmentReason = 'spillage' | 'evaporation' | 'quality_check' | 'damaged' | 'correction' | 'order_fulfillment' | 'other';

export interface ShippingAddress {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  shipping_address: ShippingAddress;
  favorite_brands: string[];
  favorite_scents: string[];
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  concentration: ConcentrationType;
  gender: GenderType;
  season: SeasonType;
  total_volume_ml: number;
  current_volume_ml: number;
  batch_code: string | null;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  price_10ml: number | null;
  price_15ml: number | null;
  price_30ml: number | null;
  price_100ml: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supply {
  id: string;
  item_name: string;
  size_value: number | null;
  stock_count: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  bkash_transaction_id: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddress;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  size_value: number;
  product_name: string;
  product_brand: string;
  batch_code: string | null;
  created_at: string;
}

export interface VolumeAdjustment {
  id: string;
  product_id: string;
  adjusted_by: string;
  previous_volume: number;
  new_volume: number;
  adjustment_amount: number;
  reason: AdjustmentReason;
  notes: string | null;
  order_id: string | null;
  created_at: string;
}

// Extended types with relations
export interface OrderWithItems extends Order {
  items: OrderItem[];
  profile?: Profile;
}

export interface ProductWithStock extends Product {
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface CustomerWithStats extends Profile {
  total_spent: number;
  order_count: number;
  last_order_date: string | null;
}

// Admin Stats
export interface AdminStats {
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  total_products: number;
  low_stock_products: number;
  total_customers: number;
  orders_today: number;
  revenue_today: number;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      supplies: {
        Row: Supply;
        Insert: Omit<Supply, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Supply, 'id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>;
      };
      volume_adjustments: {
        Row: VolumeAdjustment;
        Insert: Omit<VolumeAdjustment, 'id' | 'created_at'>;
        Update: never;
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      process_decant_order: {
        Args: { p_order_id: string; p_admin_id: string };
        Returns: { success: boolean; error?: string; message?: string };
      };
      get_admin_stats: {
        Args: Record<string, never>;
        Returns: AdminStats;
      };
      get_low_stock_products: {
        Args: { p_threshold?: number };
        Returns: Array<{
          id: string;
          name: string;
          brand: string;
          current_volume_ml: number;
          total_volume_ml: number;
          threshold: number;
        }>;
      };
      adjust_product_volume: {
        Args: {
          p_product_id: string;
          p_admin_id: string;
          p_new_volume: number;
          p_reason: AdjustmentReason;
          p_notes?: string;
        };
        Returns: {
          success: boolean;
          error?: string;
          previous_volume?: number;
          new_volume?: number;
          adjustment?: number;
        };
      };
    };
    Enums: {
      user_role: UserRole;
      concentration_type: ConcentrationType;
      gender_type: GenderType;
      season_type: SeasonType;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      adjustment_reason: AdjustmentReason;
    };
  };
}
