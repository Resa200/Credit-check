import type {
  NormalizedCreditReport,
  CreditCheckScore,
  CreditScoreFactor,
} from '@/types/adjutor.types'
import { getCreditRating } from './utils'

const MAX_SCORE = 900

/**
 * Compute a custom CreditCheck Score (0–900) from available bureau data.
 *
 * Factors (weighted):
 *  - Loan Performance    30%  (performing vs total loans)
 *  - Delinquency Penalty 25%  (fewer delinquencies = higher score)
 *  - Account Standing    20%  (good standing vs total accounts)
 *  - Enquiry Frequency   10%  (fewer recent enquiries = better)
 *  - Credit Diversity    10%  (has multiple facility types)
 *  - Bureau Score        5%   (raw bureau score normalised)
 */
export function computeCreditCheckScore(
  crc: NormalizedCreditReport | null,
  fc: NormalizedCreditReport | null
): CreditCheckScore {
  const factors: CreditScoreFactor[] = []

  // ── 1. Loan Performance (30%) ──────────────────────────────────────────────
  const loanPerf = computeLoanPerformance(crc, fc)
  factors.push({ label: 'Loan Performance', score: loanPerf, max: 100, weight: 0.3 })

  // ── 2. Delinquency Penalty (25%) ──────────────────────────────────────────
  const delinquency = computeDelinquencyScore(crc, fc)
  factors.push({ label: 'Delinquency Record', score: delinquency, max: 100, weight: 0.25 })

  // ── 3. Account Standing (20%) ─────────────────────────────────────────────
  const standing = computeAccountStanding(fc)
  factors.push({ label: 'Account Standing', score: standing, max: 100, weight: 0.2 })

  // ── 4. Enquiry Frequency (10%) ────────────────────────────────────────────
  const enquiry = computeEnquiryScore(crc, fc)
  factors.push({ label: 'Enquiry Frequency', score: enquiry, max: 100, weight: 0.1 })

  // ── 5. Credit Diversity (10%) ─────────────────────────────────────────────
  const diversity = computeDiversityScore(crc)
  factors.push({ label: 'Credit Diversity', score: diversity, max: 100, weight: 0.1 })

  // ── 6. Bureau Score (5%) ──────────────────────────────────────────────────
  const bureauScore = computeBureauScoreComponent(crc, fc)
  factors.push({ label: 'Bureau Score', score: bureauScore, max: 100, weight: 0.05 })

  // ── Weighted total ────────────────────────────────────────────────────────
  const weighted = factors.reduce((sum, f) => sum + (f.score / f.max) * f.weight, 0)
  const score = Math.round(weighted * MAX_SCORE)
  const rating = getCreditRating(score, MAX_SCORE)

  return { score, max: MAX_SCORE, rating, factors }
}

// ─── Factor Implementations ───────────────────────────────────────────────────

function computeLoanPerformance(
  crc: NormalizedCreditReport | null,
  fc: NormalizedCreditReport | null
): number {
  // From FirstCentral: performing vs total loans
  const perfStat = fc?.creditStats?.find((s) => s.label === 'Performing Loans')
  const substandardStat = fc?.creditStats?.find((s) => s.label === 'Substandard')
  const doubtfulStat = fc?.creditStats?.find((s) => s.label === 'Doubtful')
  const lostStat = fc?.creditStats?.find((s) => s.label === 'Lost')

  const performing = parseInt(perfStat?.value || '0', 10)
  const substandard = parseInt(substandardStat?.value || '0', 10)
  const doubtful = parseInt(doubtfulStat?.value || '0', 10)
  const lost = parseInt(lostStat?.value || '0', 10)
  const totalFromFC = performing + substandard + doubtful + lost

  if (totalFromFC > 0) {
    return Math.round((performing / totalFromFC) * 100)
  }

  // Fallback: from CRC loan history statuses
  const loans = crc?.loans || fc?.loans || []
  if (loans.length === 0) return 70 // No loan data = neutral score

  const settled = loans.filter((l) => {
    const s = (l.status || '').toLowerCase()
    return s.includes('settled') || s.includes('closed') || s.includes('performing')
  }).length

  return Math.round((settled / loans.length) * 100)
}

function computeDelinquencyScore(
  crc: NormalizedCreditReport | null,
  _fc: NormalizedCreditReport | null
): number {
  // From CRC facility sections
  const sections = crc?.facilitySections || []
  if (sections.length === 0) return 80 // No data = decent score

  const totalDelinquent = sections.reduce((sum, s) => sum + s.delinquentCount, 0)
  const facilitiesPresent = sections.filter((s) => s.hasFacilities).length

  if (facilitiesPresent === 0) return 85 // No facilities = good

  // Scale: 0 delinquent = 100, each delinquent reduces score
  // Cap penalty: more than 5 delinquent facilities → score of 10
  const penalty = Math.min(totalDelinquent * 18, 90)
  return Math.max(100 - penalty, 10)
}

function computeAccountStanding(fc: NormalizedCreditReport | null): number {
  const goodStat = fc?.creditStats?.find((s) => s.label === 'Good Standing')
  const badStat = fc?.creditStats?.find((s) => s.label === 'Bad Standing')
  const totalStat = fc?.creditStats?.find((s) => s.label === 'Total Accounts')

  const good = parseInt(goodStat?.value || '0', 10)
  const bad = parseInt(badStat?.value || '0', 10)
  const total = parseInt(totalStat?.value || '0', 10) || (good + bad)

  if (total === 0) return 70 // No account data = neutral

  return Math.round((good / total) * 100)
}

function computeEnquiryScore(
  crc: NormalizedCreditReport | null,
  fc: NormalizedCreditReport | null
): number {
  const enquiries = [
    ...(crc?.enquiries || []),
    ...(fc?.enquiries || []),
  ]

  if (enquiries.length === 0) return 90 // No enquiries = great

  // Fewer enquiries = better. >10 enquiries is concerning
  // Scale: 0 → 95, 1-3 → 85, 4-6 → 65, 7-10 → 45, >10 → 25
  if (enquiries.length <= 3) return 85
  if (enquiries.length <= 6) return 65
  if (enquiries.length <= 10) return 45
  return 25
}

function computeDiversityScore(crc: NormalizedCreditReport | null): number {
  const sections = crc?.facilitySections || []
  if (sections.length === 0) return 50 // No data = neutral

  const hasBank = sections.some((s) => s.label === 'Bank Credit' && s.hasFacilities)
  const hasMF = sections.some((s) => s.label === 'Microfinance Credit' && s.hasFacilities)
  const hasMG = sections.some((s) => s.label === 'Mortgage Credit' && s.hasFacilities)

  const types = [hasBank, hasMF, hasMG].filter(Boolean).length

  // 0 types = 40, 1 = 60, 2 = 80, 3 = 100
  return 40 + types * 20
}

function computeBureauScoreComponent(
  crc: NormalizedCreditReport | null,
  fc: NormalizedCreditReport | null
): number {
  const scores: number[] = []

  if (crc?.creditScore !== undefined && crc.creditScore > 0) {
    scores.push(crc.creditScore / (crc.maxScore || 850))
  }
  if (fc?.creditScore !== undefined && fc.creditScore > 0) {
    scores.push(fc.creditScore / (fc.maxScore || 850))
  }

  if (scores.length === 0) return 60 // No bureau score = neutral

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return Math.round(avg * 100)
}
