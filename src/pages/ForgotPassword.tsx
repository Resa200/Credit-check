import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Shield, ArrowLeft, Mail } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validators'
import { useAuth } from '@/hooks/useAuth'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    setLoading(true)
    try {
      await resetPassword(data.email)
      setSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C3AED]">
              <Shield size={20} className="text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[#1E293B]">Reset password</h1>
          <p className="text-sm text-[#94A3B8]">
            {sent
              ? 'Check your inbox for the reset link'
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 flex flex-col items-center gap-4 shadow-sm text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D1FAE5]">
              <Mail size={24} className="text-[#059669]" />
            </div>
            <p className="text-sm text-[#64748B]">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
            <Link
              to="/login"
              className="text-sm text-[#7C3AED] font-medium hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-4 shadow-sm"
          >
            <FormField
              label="Email"
              fieldId="email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
          </form>
        )}

        {!sent && (
          <p className="text-sm text-center text-[#94A3B8] mt-6">
            <Link
              to="/login"
              className="text-[#7C3AED] font-medium hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
