import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Shield } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validators'
import { useAuth } from '@/hooks/useAuth'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  async function onSubmit(data: ResetPasswordFormValues) {
    setLoading(true)
    try {
      await updatePassword(data.password)
      toast.success('Password updated successfully!')
      navigate('/login')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password'
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
          <h1 className="text-2xl font-bold text-[#1E293B]">Set new password</h1>
          <p className="text-sm text-[#94A3B8]">Choose a strong password for your account</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-4 shadow-sm"
        >
          <FormField
            label="New Password"
            fieldId="password"
            type="password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            error={errors.password?.message}
            required
            {...register('password')}
          />

          <FormField
            label="Confirm New Password"
            fieldId="confirm_password"
            type="password"
            placeholder="Re-enter your new password"
            error={errors.confirm_password?.message}
            required
            {...register('confirm_password')}
          />

          <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  )
}
