import { create } from 'zustand'
import type {
  ServiceType,
  AppStep,
  BVNData,
  AccountData,
  CreditReportData,
} from '@/types/adjutor.types'

interface AppState {
  // current service selected
  activeService: ServiceType

  // current step in the flow
  step: AppStep

  // form data collected across steps (BVN, contact, OTP, etc.)
  formData: Record<string, string>

  // results per service
  bvnResult: BVNData | null
  accountResult: AccountData | null
  creditResult: CreditReportData | null

  // error message
  error: string | null

  // whether an unauthenticated user has already used their free lookup
  guestLookupUsed: boolean

  // actions
  selectService: (service: ServiceType) => void
  setStep: (step: AppStep) => void
  setFormData: (data: Record<string, string>) => void
  setBVNResult: (data: BVNData) => void
  setAccountResult: (data: AccountData) => void
  setCreditResult: (data: CreditReportData) => void
  setError: (msg: string) => void
  markGuestLookupUsed: () => void
  reset: () => void
  goToServices: () => void
}

const initialState = {
  activeService: null as ServiceType,
  step: 'select' as AppStep,
  formData: {} as Record<string, string>,
  bvnResult: null,
  accountResult: null,
  creditResult: null,
  error: null,
  guestLookupUsed: false,
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  selectService: (service) =>
    set({ activeService: service, step: 'input', error: null }),

  setStep: (step) => set({ step }),

  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),

  setBVNResult: (data) => set({ bvnResult: data, step: 'result' }),

  setAccountResult: (data) => set({ accountResult: data, step: 'result' }),

  setCreditResult: (data) => set({ creditResult: data, step: 'result' }),

  setError: (msg) => set({ error: msg, step: 'error' }),

  markGuestLookupUsed: () => set({ guestLookupUsed: true }),

  reset: () => set((state) => ({
    ...initialState,
    guestLookupUsed: state.guestLookupUsed,
  })),

  goToServices: () =>
    set((state) => ({
      step: 'select',
      activeService: null,
      error: null,
      formData: {},
      bvnResult: null,
      accountResult: null,
      creditResult: null,
      guestLookupUsed: state.guestLookupUsed,
    })),
}))
