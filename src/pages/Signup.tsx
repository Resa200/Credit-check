import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Shield } from 'lucide-react'
import { signupSchema, type SignupFormValues } from '@/lib/validators'
import { useAuth } from '@/hooks/useAuth'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  if (isAuthenticated) {
    navigate('/services', { replace: true })
    return null
  }

  async function onSubmit(data: SignupFormValues) {
    setLoading(true)
    try {
      await signUp(data.email, data.password, data.full_name)
      toast.success('Account created! Please check your email to verify.')
      navigate('/services')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C3AED]">
              <Shield size={20} className="text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[#1E293B]">Create your account</h1>
          <p className="text-sm text-[#94A3B8]">Save and access your verification history</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-4 shadow-sm"
        >
          <FormField
            label="Full Name"
            fieldId="full_name"
            type="text"
            placeholder="John Doe"
            error={errors.full_name?.message}
            required
            {...register('full_name')}
          />

          <FormField
            label="Email"
            fieldId="email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <FormField
            label="Password"
            fieldId="password"
            type="password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            error={errors.password?.message}
            required
            {...register('password')}
          />

          <FormField
            label="Confirm Password"
            fieldId="confirm_password"
            type="password"
            placeholder="Re-enter your password"
            error={errors.confirm_password?.message}
            required
            {...register('confirm_password')}
          />

          <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-sm text-center text-[#94A3B8] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#7C3AED] font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
