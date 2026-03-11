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
  formatted_dob?: string
  mobile: string
  mobile2?: string | null
  email: string
  gender: string
  marital_status?: string | null
  nationality?: string | null
  nin?: string | null
  name_on_card?: string | null
  lga_of_origin?: string | null
  lga_of_residence?: string | null
  state_of_origin?: string | null
  state_of_residence: string
  residential_address?: string | null
  registration_date?: string | null
  enrollment_bank?: string | null
  enrollment_branch?: string | null
  level_of_account?: string | null
  watchlisted?: number | null
  image_url?: string | null
  base64Image?: string | null
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
