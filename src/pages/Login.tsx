import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Shield } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '@/lib/validators'
import { useAuth } from '@/hooks/useAuth'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (isAuthenticated) navigate('/services', { replace: true })
  }, [isAuthenticated, navigate])

  async function onSubmit(data: LoginFormValues) {
    setLoading(true)
    try {
      await signIn(data.email, data.password)
      toast.success('Welcome back!')
      navigate('/services')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
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
          <h1 className="text-2xl font-bold text-[#1E293B]">Welcome back</h1>
          <p className="text-sm text-[#94A3B8]">Sign in to access your verification history</p>
        </div>

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

          <FormField
            label="Password"
            fieldId="password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            required
            {...register('password')}
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-[#7C3AED] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Sign In
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#94A3B8]">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            loading={googleLoading}
            onClick={async () => {
              setGoogleLoading(true)
              try {
                await signInWithGoogle()
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Google sign in failed'
                toast.error(message)
                setGoogleLoading(false)
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </form>

        <p className="text-sm text-center text-[#94A3B8] mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#7C3AED] font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
