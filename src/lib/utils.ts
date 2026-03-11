import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { CreditReportData, CRCReportData, NormalizedCreditReport } from '@/types/adjutor.types'

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

/** Normalize a raw credit report response (CRC or generic) into a display-ready shape */
export function normalizeCreditReport(
  data: CreditReportData,
  bureau: string
): NormalizedCreditReport {
  // ── CRC structure ──────────────────────────────────────────────────────────
  const crc = data as CRCReportData
  if (crc.nano_consumer_profile) {
    const cd = crc.nano_consumer_profile.consumer_details

    const identifications = (cd?.identification ?? []).map((id) => ({
      type: id.id_display_name,
      value: id.id_value,
    }))

    const facilitySections = []

    const creditSummary = crc.credit_nano_summary?.summary
    if (creditSummary) {
      facilitySections.push({
        label: 'Bank Credit',
        hasFacilities: creditSummary.has_creditfacilities === 'YES',
        delinquentCount: parseInt(creditSummary.no_of_delinqcreditfacilities ?? '0', 10),
        lastReportedDate: creditSummary.last_reported_date,
      })
    }

    const mfSummary = crc.mfcredit_nano_summary?.summary
    if (mfSummary) {
      facilitySections.push({
        label: 'Microfinance Credit',
        hasFacilities: mfSummary.has_creditfacilities === 'YES',
        delinquentCount: parseInt(mfSummary.no_of_delinqcreditfacilities ?? '0', 10),
        lastReportedDate: mfSummary.last_reported_date,
      })
    }

    const mgSummary = crc.mgcredit_nano_summary?.summary
    if (mgSummary) {
      facilitySections.push({
        label: 'Mortgage Credit',
        hasFacilities: mgSummary.has_creditfacilities === 'YES',
        delinquentCount: parseInt(mgSummary.no_of_delinqcreditfacilities ?? '0', 10),
        lastReportedDate: mgSummary.last_reported_date,
      })
    }

    return {
      fullName: cd?.name,
      dateOfBirth: cd?.date_of_birth,
      gender: cd?.gender,
      identifications: identifications.length ? identifications : undefined,
      facilitySections: facilitySections.length ? facilitySections : undefined,
      lastCheckedDate: crc.last_checked_date,
      raw: data,
    }
  }

  // ── Generic / FirstCentral fallback ───────────────────────────────────────
  void bureau // reserved for future bureau-specific handling
  return {
    fullName: data.personal_info?.full_name,
    dateOfBirth: data.personal_info?.date_of_birth,
    gender: data.personal_info?.gender,
    creditScore: data.credit_summary?.credit_score,
    maxScore: data.credit_summary?.max_score,
    loans: data.loan_history,
    enquiries: data.enquiry_history,
    raw: data,
  }
}
