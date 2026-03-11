import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type {
  CreditReportData,
  CreditReportObject,
  CRCReportData,
  FirstCentralItem,
  NormalizedCreditReport,
} from '@/types/adjutor.types'

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

/** Normalize a raw credit report response (CRC or FirstCentral) into a display-ready shape */
export function normalizeCreditReport(
  data: CreditReportData,
  _bureau: string
): NormalizedCreditReport {
  // ── FirstCentral: data is an array ─────────────────────────────────────────
  if (Array.isArray(data)) {
    const items = data as FirstCentralItem[]

    const pd = items.find((i) => i.PersonalDetailsSummary)?.PersonalDetailsSummary?.[0]
    const cs = items.find((i) => i.CreditSummary)?.CreditSummary?.[0]
    const perf = items.find((i) => i.PerformanceClassification)?.PerformanceClassification?.[0]

    const fullName = pd
      ? [pd.Surname, pd.FirstName, pd.OtherNames].filter(Boolean).join(' ')
      : undefined

    const address = [pd?.ResidentialAddress1, pd?.ResidentialAddress2]
      .filter(Boolean)
      .join(', ') || undefined

    const identifications: { type: string; value: string }[] = []
    if (pd?.BankVerificationNo) identifications.push({ type: 'BVN', value: pd.BankVerificationNo })
    if (pd?.NationalIDNo) identifications.push({ type: 'NIN', value: pd.NationalIDNo })
    if (pd?.PassportNo) identifications.push({ type: 'Passport', value: pd.PassportNo })
    if (pd?.DriversLicenseNo) identifications.push({ type: "Driver's License", value: pd.DriversLicenseNo })
    if (pd?.PencomIDNo) identifications.push({ type: 'PenCom ID', value: pd.PencomIDNo })

    const creditStats: { label: string; value: string }[] = []
    if (cs?.TotalNumberOfAccountsReported) creditStats.push({ label: 'Total Accounts', value: cs.TotalNumberOfAccountsReported })
    if (cs?.NumberOfAccountsInGoodStanding) creditStats.push({ label: 'Good Standing', value: cs.NumberOfAccountsInGoodStanding })
    if (cs?.NumberOfAccountsInBadStanding) creditStats.push({ label: 'Bad Standing', value: cs.NumberOfAccountsInBadStanding })
    if (perf?.NoOfLoansPerforming) creditStats.push({ label: 'Performing Loans', value: perf.NoOfLoansPerforming })
    if (perf?.NoOfLoansSubstandard) creditStats.push({ label: 'Substandard', value: perf.NoOfLoansSubstandard })
    if (perf?.NoOfLoansDoubtful) creditStats.push({ label: 'Doubtful', value: perf.NoOfLoansDoubtful })
    if (perf?.NoOfLoansLost) creditStats.push({ label: 'Lost', value: perf.NoOfLoansLost })

    return {
      fullName,
      dateOfBirth: pd?.BirthDate,
      gender: pd?.Gender,
      phone: pd?.CellularNo || pd?.HomeTelephoneNo || pd?.WorkTelephoneNo,
      address,
      identifications: identifications.length ? identifications : undefined,
      creditStats: creditStats.length ? creditStats : undefined,
    }
  }

  // ── CRC: object with nano_consumer_profile ─────────────────────────────────
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
    }
  }

  // ── Generic object fallback ────────────────────────────────────────────────
  const obj = data as CreditReportObject
  const cs2 = obj.credit_summary

  const creditStats: { label: string; value: string }[] = []
  if (cs2?.total_facilities !== undefined) creditStats.push({ label: 'Total Facilities', value: String(cs2.total_facilities) })
  if (cs2?.active_loans !== undefined) creditStats.push({ label: 'Active Loans', value: String(cs2.active_loans) })
  if (cs2?.settled_loans !== undefined) creditStats.push({ label: 'Settled Loans', value: String(cs2.settled_loans) })
  if (cs2?.past_due !== undefined) creditStats.push({ label: 'Past Due', value: String(cs2.past_due) })
  if (cs2?.total_outstanding !== undefined) creditStats.push({ label: 'Total Outstanding', value: formatNaira(cs2.total_outstanding) })

  return {
    fullName: obj.personal_info?.full_name,
    dateOfBirth: obj.personal_info?.date_of_birth,
    gender: obj.personal_info?.gender,
    creditScore: cs2?.credit_score,
    maxScore: cs2?.max_score,
    creditStats: creditStats.length ? creditStats : undefined,
    loans: obj.loan_history,
    enquiries: obj.enquiry_history,
  }
}
