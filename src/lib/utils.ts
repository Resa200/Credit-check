import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Mask a string, keeping first and last n chars visible */
export function mask(value: string, keepStart = 3, keepEnd = 4): string {
  if (!value || value.length <= keepStart + keepEnd) return value
  const stars = '*'.repeat(Math.max(value.length - keepStart - keepEnd, 3))
  return `${value.slice(0, keepStart)}${stars}${value.slice(-keepEnd)}`
}

/** Format a date string (YYYY-MM-DD) to readable form */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/** Format a number as Nigerian Naira */
export function formatNaira(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '—'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

/** Derive a credit score label from a numeric score */
export function getCreditRating(score: number, max = 850): string {
  const pct = score / max
  if (pct >= 0.8) return 'Excellent'
  if (pct >= 0.67) return 'Good'
  if (pct >= 0.5) return 'Fair'
  return 'Poor'
}

/** Get colour class for a credit rating */
export function getRatingColor(rating: string): string {
  switch (rating.toLowerCase()) {
    case 'excellent':
      return 'text-green-600'
    case 'good':
      return 'text-emerald-500'
    case 'fair':
      return 'text-amber-500'
    case 'poor':
      return 'text-red-500'
    default:
      return 'text-slate-500'
  }
}

/** Capitalise first letter */
export function capitalise(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/** Build full name from parts */
export function buildFullName(
  first: string,
  middle: string,
  last: string
): string {
  return [first, middle, last].filter(Boolean).join(' ')
}
