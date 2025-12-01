import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { LOW_STOCK_THRESHOLD, OUT_OF_STOCK_THRESHOLD, SIZE_PRICE_FIELDS } from "./constants"
import type { Product, SizeOption } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency (Bangladeshi Taka)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Get stock status
export function getStockStatus(currentVolume: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (currentVolume <= OUT_OF_STOCK_THRESHOLD) return 'out_of_stock'
  if (currentVolume < LOW_STOCK_THRESHOLD) return 'low_stock'
  return 'in_stock'
}

// Get available sizes for a product
export function getAvailableSizes(product: Product, requestedVolume: number): SizeOption[] {
  const sizes: SizeOption[] = [10, 15, 30, 100]
  return sizes.filter((size) => {
    const priceField = SIZE_PRICE_FIELDS[size] as keyof Product
    const price = product[priceField]
    return price !== null && product.current_volume_ml >= size * requestedVolume
  })
}

// Get price for a specific size
export function getPriceForSize(product: Product, size: SizeOption): number | null {
  const priceField = SIZE_PRICE_FIELDS[size] as keyof Product
  return product[priceField] as number | null
}

// Format date
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

// Format date with time
export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString))
}

// Generate order ID display
export function formatOrderId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Format notes array for display
export function formatNotes(notes: string[]): string {
  if (!notes || notes.length === 0) return '-'
  return notes.join(', ')
}
