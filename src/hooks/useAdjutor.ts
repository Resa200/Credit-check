import { adjutor } from '@/lib/adjutor'
import type {
  BVNInitiateResponse,
  BVNResponse,
  AccountResponse,
  CreditReportResponse,
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
}
