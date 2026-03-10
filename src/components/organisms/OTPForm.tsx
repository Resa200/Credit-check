import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { otpSchema, type OTPFormValues } from '@/lib/validators'
import OTPInput from '@/components/molecules/OTPInput'
import Button from '@/components/atoms/Button'
import { useOTPTimer } from '@/hooks/useOTPTimer'

interface OTPFormProps {
  maskedContact: string
  onSubmit: (data: OTPFormValues) => void
  onResend: () => void
  loading: boolean
}

export default function OTPForm({
  maskedContact,
  onSubmit,
  onResend,
  loading,
}: OTPFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormValues>({ resolver: zodResolver(otpSchema) })

  const { secondsLeft, restart } = useOTPTimer(30)
  const [resendLoading, setResendLoading] = useState(false)

  async function handleResend() {
    setResendLoading(true)
    onResend()
    restart()
    setResendLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-sm text-[#64748B]">
          A one-time code has been sent to
        </p>
        <p className="text-sm font-semibold text-[#1E293B] mt-0.5">
          {maskedContact}
        </p>
      </div>

      <Controller
        name="otp"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <OTPInput
            value={field.value}
            onChange={field.onChange}
            error={errors.otp?.message}
          />
        )}
      />

      <Button type="submit" loading={loading} size="lg" className="w-full">
        Verify OTP
      </Button>

      <div className="text-center">
        {secondsLeft > 0 ? (
          <p className="text-xs text-[#94A3B8]">
            Resend code in{' '}
            <span className="text-[#7C3AED] font-medium">{secondsLeft}s</span>
          </p>
        ) : (
          <button
            type="button"
            disabled={resendLoading}
            onClick={handleResend}
            className="text-xs text-[#7C3AED] hover:underline font-medium disabled:opacity-50"
          >
            Resend OTP
          </button>
        )}
      </div>
    </form>
  )
}
