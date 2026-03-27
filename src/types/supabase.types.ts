// ─── Common columns shared by all tables ─────────────────────────────────────

export interface CommonColumns {
  id: string
  meta: Record<string, unknown> | null
  created_on: string
  created_by: string | null
  modified_on: string
  modified_by: string | null
  deleted_on: string | null
  deleted_by: string | null
  deleted_flag: boolean
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface UserRow extends CommonColumns {
  auth_id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
}

// ─── Data Lookup Requests ────────────────────────────────────────────────────

export interface DataLookupRequestRow extends CommonColumns {
  user_id: string
  service_type: 'bvn' | 'account' | 'credit'
  request_payload: Record<string, unknown>
  response_payload: Record<string, unknown> | null
  status: 'pending' | 'success' | 'error'
  adjutor_reference: string | null
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export interface AuditLogRow extends CommonColumns {
  user_id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'expired' | 'none'

export interface SubscriptionRow extends CommonColumns {
  user_id: string
  paystack_customer_code: string | null
  paystack_subscription_code: string | null
  paystack_plan_code: string | null
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancelled_at: string | null
}

// ─── Payment Cards ───────────────────────────────────────────────────────────

export interface PaymentCardRow extends CommonColumns {
  user_id: string
  paystack_authorization_code: string
  card_bin: string | null
  card_last4: string | null
  card_exp_month: string | null
  card_exp_year: string | null
  card_type: string | null
  bank: string | null
  is_default: boolean
}

// ─── Payment Transactions ────────────────────────────────────────────────────

export interface PaymentTransactionRow extends CommonColumns {
  user_id: string
  subscription_id: string | null
  paystack_reference: string | null
  amount: number
  currency: string
  status: 'success' | 'failed' | 'abandoned' | 'reversed'
  payment_type: 'subscription' | 'one_time'
}

// ─── Database type map (for Supabase client generics) ────────────────────────

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: {
          id?: string
          auth_id: string
          email: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Update: {
          id?: string
          auth_id?: string
          email?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Relationships: []
      }
      data_lookup_requests: {
        Row: DataLookupRequestRow
        Insert: {
          id?: string
          user_id: string
          service_type: 'bvn' | 'account' | 'credit'
          request_payload: Record<string, unknown>
          response_payload?: Record<string, unknown> | null
          status?: 'pending' | 'success' | 'error'
          adjutor_reference?: string | null
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          service_type?: 'bvn' | 'account' | 'credit'
          request_payload?: Record<string, unknown>
          response_payload?: Record<string, unknown> | null
          status?: 'pending' | 'success' | 'error'
          adjutor_reference?: string | null
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Relationships: []
      }
      audit_logs: {
        Row: AuditLogRow
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Record<string, unknown> | null
          ip_address?: string | null
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Record<string, unknown> | null
          ip_address?: string | null
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Relationships: []
      }
      subscriptions: {
        Row: SubscriptionRow
        Insert: {
          id?: string
          user_id: string
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          paystack_plan_code?: string | null
          status?: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          paystack_plan_code?: string | null
          status?: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Relationships: []
      }
      payment_cards: {
        Row: PaymentCardRow
        Insert: {
          id?: string
          user_id: string
          paystack_authorization_code: string
          card_bin?: string | null
          card_last4?: string | null
          card_exp_month?: string | null
          card_exp_year?: string | null
          card_type?: string | null
          bank?: string | null
          is_default?: boolean
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          paystack_authorization_code?: string
          card_bin?: string | null
          card_last4?: string | null
          card_exp_month?: string | null
          card_exp_year?: string | null
          card_type?: string | null
          bank?: string | null
          is_default?: boolean
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Relationships: []
      }
      payment_transactions: {
        Row: PaymentTransactionRow
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          paystack_reference?: string | null
          amount: number
          currency?: string
          status: 'success' | 'failed' | 'abandoned' | 'reversed'
          payment_type?: 'subscription' | 'one_time'
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          paystack_reference?: string | null
          amount?: number
          currency?: string
          status?: 'success' | 'failed' | 'abandoned' | 'reversed'
          payment_type?: 'subscription' | 'one_time'
          meta?: Record<string, unknown> | null
          created_on?: string
          created_by?: string | null
          modified_on?: string
          modified_by?: string | null
          deleted_on?: string | null
          deleted_by?: string | null
          deleted_flag?: boolean
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
