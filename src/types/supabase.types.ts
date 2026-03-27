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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
