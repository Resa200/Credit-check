// ─── Base Response ────────────────────────────────────────────────────────────

export interface AdjutorMeta {
  cost: number
  balance: number
}

export interface AdjutorResponse<T = unknown> {
  status: string
  message: string
  data: T
  meta: AdjutorMeta
}

// ─── BVN Lookup ───────────────────────────────────────────────────────────────

export interface BVNInitiateResponse {
  status: string
  message: string
  data: string // masked contact
  meta: AdjutorMeta
}

export interface BVNData {
  reference: number
  bvn: string
  first_name: string
  middle_name: string
  last_name: string
  dob: string
  mobile: string
  email: string
  gender: string
  state_of_residence: string
  image_url: string
}

export type BVNResponse = AdjutorResponse<BVNData>

// ─── Account Verification ─────────────────────────────────────────────────────

export interface AccountData {
  bank_code: string
  account_name: string
  account_number: string
  bvn: string
}

export type AccountResponse = AdjutorResponse<AccountData>

// ─── Credit Report ────────────────────────────────────────────────────────────

export interface CreditSummary {
  total_facilities?: number
  active_loans?: number
  settled_loans?: number
  past_due?: number
  total_outstanding?: number
  credit_score?: number
  max_score?: number
  rating?: string
}

export interface LoanRecord {
  lender?: string
  loan_amount?: number
  outstanding_balance?: number
  status?: string
  date_reported?: string
  loan_type?: string
}

export interface EnquiryRecord {
  enquiry_date?: string
  institution?: string
  purpose?: string
}

export interface PersonalInfo {
  full_name?: string
  date_of_birth?: string
  gender?: string
  phone?: string
  address?: string
  bvn?: string
}

export interface CreditReportData {
  personal_info?: PersonalInfo
  credit_summary?: CreditSummary
  loan_history?: LoanRecord[]
  enquiry_history?: EnquiryRecord[]
  [key: string]: unknown // allows for bureau-specific variations
}

export type CreditReportResponse = AdjutorResponse<CreditReportData>

// ─── Bank List ────────────────────────────────────────────────────────────────

export interface Bank {
  id: number
  code: string   // normalised — always populated by useBankList
  name: string
}

export type BankListResponse = AdjutorResponse<Bank[]>

// ─── App State Types ──────────────────────────────────────────────────────────

export type ServiceType = 'bvn' | 'account' | 'credit' | null

export type AppStep =
  | 'select'
  | 'input'
  | 'otp'
  | 'loading'
  | 'result'
  | 'error'

export type BureauType = 'crc' | 'firstcentral'
