import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { UserRow } from '@/types/supabase.types'

interface PendingResult {
  serviceType: 'bvn' | 'account' | 'credit'
  requestPayload: Record<string, unknown>
  responsePayload: Record<string, unknown>
}

interface AuthState {
  session: Session | null
  user: User | null
  profile: UserRow | null
  loading: boolean
  pendingResult: PendingResult | null

  setSession: (session: Session | null) => void
  setUser: (user: User | null) => void
  setProfile: (profile: UserRow | null) => void
  setLoading: (loading: boolean) => void
  setPendingResult: (result: PendingResult | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  pendingResult: null,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setPendingResult: (pendingResult) => set({ pendingResult }),
  clear: () => set({ session: null, user: null, profile: null, pendingResult: null }),
}))
