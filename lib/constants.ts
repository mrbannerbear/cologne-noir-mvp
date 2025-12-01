// Size options for decants
export const SIZE_OPTIONS = [10, 15, 30, 100] as const;
export type SizeOption = (typeof SIZE_OPTIONS)[number];

// Price field mapping
export const SIZE_PRICE_FIELDS = {
  10: 'price_10ml',
  15: 'price_15ml',
  30: 'price_30ml',
  100: 'price_100ml',
} as const;

// Concentration labels
export const CONCENTRATION_LABELS = {
  EDT: 'Eau de Toilette',
  EDP: 'Eau de Parfum',
  Extrait: 'Extrait de Parfum',
  Parfum: 'Parfum',
  Cologne: 'Cologne',
} as const;

// Gender labels
export const GENDER_LABELS = {
  masculine: 'Masculine',
  feminine: 'Feminine',
  unisex: 'Unisex',
} as const;

// Season labels
export const SEASON_LABELS = {
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
  winter: 'Winter',
  all: 'All Seasons',
} as const;

// Order status labels
export const ORDER_STATUS_LABELS = {
  pending_payment: 'Pending Payment',
  new: 'New',
  decanting: 'Decanting',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
} as const;

// Payment status labels
export const PAYMENT_STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
} as const;

// Payment method labels
export const PAYMENT_METHOD_LABELS = {
  cod: 'Cash on Delivery',
  bkash: 'bKash',
} as const;

// Adjustment reason labels
export const ADJUSTMENT_REASON_LABELS = {
  spillage: 'Spillage',
  evaporation: 'Evaporation',
  quality_check: 'Quality Check',
  damaged: 'Damaged',
  correction: 'Correction',
  order_fulfillment: 'Order Fulfillment',
  other: 'Other',
} as const;

// Stock thresholds
export const LOW_STOCK_THRESHOLD = 10; // ml
export const OUT_OF_STOCK_THRESHOLD = 0; // ml

// Shipping cost
export const SHIPPING_COST = 60; // Default shipping cost

// Admin navigation items
export const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/orders', label: 'Orders', icon: 'Package' },
  { href: '/admin/products', label: 'Products', icon: 'FlaskConical' },
  { href: '/admin/customers', label: 'Customers', icon: 'Users' },
  { href: '/admin/inventory', label: 'Inventory', icon: 'Boxes' },
  { href: '/admin/supplies', label: 'Supplies', icon: 'Box' },
] as const;

// Customer navigation items
export const CUSTOMER_NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/cart', label: 'Cart' },
  { href: '/orders', label: 'Orders' },
] as const;
