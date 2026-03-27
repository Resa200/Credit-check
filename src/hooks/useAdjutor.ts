import { adjutor } from '@/lib/adjutor'
import { normalizeCreditReport } from '@/lib/utils'
import { computeCreditCheckScore } from '@/lib/creditScore'
import type {
  BVNInitiateResponse,
  BVNResponse,
  AccountResponse,
  CreditReportResponse,
  CreditReportData,
  CombinedCreditReport,
  NormalizedCreditReport,
} from '@/types/adjutor.types'

export const adjutorApi = {
  /** Step 1 — Initiate BVN OTP */
  async initiateBVN(bvn: string, contact: string): Promise<BVNInitiateResponse> {
    return adjutor.post<BVNInitiateResponse>(
      `/verification/bvn/${bvn}`,
      { contact }
    )
  },

  /** Step 2 — Complete BVN with OTP */
  async verifyBVN(bvn: string, otp: string): Promise<BVNResponse> {
    return adjutor.put<BVNResponse>(
      `/verification/bvn/${bvn}`,
      { otp }
    )
  },

  /** Verify a bank account number */
  async verifyAccount(
    account_number: string,
    bank_code: string
  ): Promise<AccountResponse> {
    return adjutor.post<AccountResponse>('/verification/bankaccount/bvn', {
      account_number,
      bank_code,
    })
  },

  /** Pull a credit report from a bureau */
  async getCreditReport(
    bureau: string,
    bvn: string
  ): Promise<CreditReportResponse> {
    return adjutor.get<CreditReportResponse>(
      `/creditbureaus/${bureau}/${bvn}`
    )
  },

  /** Pull credit reports from both bureaus and compute a combined score */
  async getCombinedCreditReport(bvn: string): Promise<CombinedCreditReport> {
    const [crcResult, fcResult] = await Promise.allSettled([
      adjutor.get<CreditReportResponse>(`/creditbureaus/crc/${bvn}`),
      adjutor.get<CreditReportResponse>(`/creditbureaus/firstcentral/${bvn}`),
    ])

    const errors: { bureau: string; message: string }[] = []

    let crcRaw: CreditReportData | null = null
    let crcNormalized: NormalizedCreditReport | null = null
    if (crcResult.status === 'fulfilled') {
      crcRaw = crcResult.value.data
      crcNormalized = normalizeCreditReport(crcRaw, 'crc')
    } else {
      errors.push({
        bureau: 'CRC',
        message: crcResult.reason?.message || 'CRC request failed',
      })
    }

    let fcRaw: CreditReportData | null = null
    let fcNormalized: NormalizedCreditReport | null = null
    if (fcResult.status === 'fulfilled') {
      fcRaw = fcResult.value.data
      fcNormalized = normalizeCreditReport(fcRaw, 'firstcentral')
    } else {
      errors.push({
        bureau: 'FirstCentral',
        message: fcResult.reason?.message || 'FirstCentral request failed',
      })
    }

    if (!crcNormalized && !fcNormalized) {
      throw new Error('Both credit bureaus failed. Please try again.')
    }

    const creditCheckScore = computeCreditCheckScore(crcNormalized, fcNormalized)

    return {
      crc: crcNormalized,
      firstCentral: fcNormalized,
      crcRaw,
      firstCentralRaw: fcRaw,
      creditCheckScore,
      errors,
      fetchedAt: new Date().toISOString(),
    }
  },
}
