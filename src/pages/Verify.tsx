import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppStore } from '@/store/appStore'
import { adjutorApi } from '@/hooks/useAdjutor'
import AppShell from '@/components/templates/AppShell'
import ServiceLayout from '@/components/templates/ServiceLayout'
import Spinner from '@/components/atoms/Spinner'

// Forms
import BVNForm from '@/components/organisms/BVNForm'
import OTPForm from '@/components/organisms/OTPForm'
import AccountForm from '@/components/organisms/AccountForm'
import CreditReportForm from '@/components/organisms/CreditReportForm'

// Results
import BVNResult from '@/components/organisms/BVNResult'
import AccountResult from '@/components/organisms/AccountResult'
import CreditReportResult from '@/components/organisms/CreditReportResult'

import type { BVNFormValues, AccountFormValues, CreditReportFormValues } from '@/lib/validators'
import type { OTPFormValues } from '@/lib/validators'
import { AlertTriangle } from 'lucide-react'
import Button from '@/components/atoms/Button'

// ─── Service metadata ─────────────────────────────────────────────────────────
const serviceInfo = {
  bvn: {
    title: 'BVN Lookup',
    subtitle: 'Retrieve details linked to your Bank Verification Number.',
  },
  account: {
    title: 'Account Verification',
    subtitle: 'Confirm a bank account and retrieve the registered account name.',
  },
  credit: {
    title: 'Credit Report',
    subtitle: 'Pull your full credit report from CRC or FirstCentral.',
  },
}

export default function Verify() {
  const navigate = useNavigate()
  const {
    activeService,
    step,
    formData,
    bvnResult,
    accountResult,
    creditResult,
    error,
    setStep,
    setFormData,
    setBVNResult,
    setAccountResult,
    setCreditResult,
    setError,
    reset,
    goToServices,
  } = useAppStore()

  // Redirect if no service selected
  useEffect(() => {
    if (!activeService) navigate('/services')
  }, [activeService, navigate])

  if (!activeService) return null

  const info = serviceInfo[activeService]

  // ── BVN Step 1 ──────────────────────────────────────────────────────────────
  async function handleBVNSubmit(data: BVNFormValues) {
    setStep('loading')
    try {
      const res = await adjutorApi.initiateBVN(data.bvn, data.contact)
      setFormData({ bvn: data.bvn, maskedContact: res.data })
      setStep('otp')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP'
      setError(message)
      toast.error(message)
    }
  }

  // ── BVN Step 2 (OTP) ────────────────────────────────────────────────────────
  async function handleOTPSubmit(data: OTPFormValues) {
    setStep('loading')
    try {
      const res = await adjutorApi.verifyBVN(formData.bvn, data.otp)
      setBVNResult(res.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid OTP. Please try again.'
      setError(message)
      toast.error(message)
    }
  }

  async function handleResendOTP() {
    try {
      const res = await adjutorApi.initiateBVN(formData.bvn, formData.contact)
      setFormData({ maskedContact: res.data })
      toast.success('OTP resent successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend OTP'
      toast.error(message)
    }
  }

  // ── Account ─────────────────────────────────────────────────────────────────
  async function handleAccountSubmit(data: AccountFormValues) {
    setStep('loading')
    try {
      const res = await adjutorApi.verifyAccount(data.account_number, data.bank_code)
      setAccountResult(res.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Account verification failed'
      setError(message)
      toast.error(message)
    }
  }

  // ── Credit Report ───────────────────────────────────────────────────────────
  async function handleCreditSubmit(data: CreditReportFormValues) {
    setStep('loading')
    setFormData({ bureau: data.bureau })
    try {
      const res = await adjutorApi.getCreditReport(data.bureau, data.bvn)
      setCreditResult(res.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve credit report'
      setError(message)
      toast.error(message)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      {/* Loading full-screen overlay */}
      {step === 'loading' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-[#64748B]">
              {activeService === 'bvn' && formData.bvn
                ? 'Verifying BVN…'
                : activeService === 'account'
                ? 'Verifying account…'
                : 'Fetching credit report…'}
            </p>
          </div>
        </div>
      )}

      {/* Result screens — full width card */}
      {step === 'result' && (
        <ServiceLayout title={info.title} showBack={false}>
          {activeService === 'bvn' && bvnResult && (
            <BVNResult
              data={bvnResult}
              onCheckAnother={reset}
              onBackToServices={goToServices}
            />
          )}
          {activeService === 'account' && accountResult && (
            <AccountResult
              data={accountResult}
              onCheckAnother={reset}
              onBackToServices={goToServices}
            />
          )}
          {activeService === 'credit' && creditResult && (
            <CreditReportResult
              data={creditResult}
              bureau={formData.bureau || 'crc'}
              onCheckAnother={reset}
              onBackToServices={goToServices}
            />
          )}
        </ServiceLayout>
      )}

      {/* Error screen */}
      {step === 'error' && (
        <ServiceLayout title="Something went wrong">
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFE4E6]">
              <AlertTriangle size={22} className="text-[#F43F5E]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1E293B] mb-1">Verification Failed</p>
              <p className="text-sm text-[#64748B]">{error}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('input')}
              >
                Edit Details
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={goToServices}
              >
                Back to Services
              </Button>
            </div>
          </div>
        </ServiceLayout>
      )}

      {/* Input / OTP screens */}
      {(step === 'input' || step === 'otp') && (
        <ServiceLayout title={info.title} subtitle={info.subtitle}>
          {activeService === 'bvn' && step === 'input' && (
            <BVNForm onSubmit={handleBVNSubmit} loading={false} />
          )}

          {activeService === 'bvn' && step === 'otp' && (
            <OTPForm
              maskedContact={formData.maskedContact || ''}
              onSubmit={handleOTPSubmit}
              onResend={handleResendOTP}
              loading={false}
            />
          )}

          {activeService === 'account' && (
            <AccountForm onSubmit={handleAccountSubmit} loading={false} />
          )}

          {activeService === 'credit' && (
            <CreditReportForm onSubmit={handleCreditSubmit} loading={false} />
          )}
        </ServiceLayout>
      )}
    </AppShell>
  )
}
