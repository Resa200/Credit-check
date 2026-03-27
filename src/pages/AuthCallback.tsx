import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Spinner from '@/components/atoms/Spinner'

/**
 * Handles Supabase auth redirects (OAuth, email confirmation, password reset).
 *
 * With detectSessionInUrl: true, the Supabase client automatically exchanges
 * the code from the URL. We just wait for the session to be established,
 * then redirect based on the flow type.
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')

    // Listen for the auth state change that signals the session is ready
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            if (type === 'recovery') {
              navigate('/reset-password', { replace: true })
            } else {
              navigate('/services', { replace: true })
            }
          }
        }
      }
    )

    // Fallback: if the session is already established (e.g. auto-detected),
    // check immediately after a short delay
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        if (type === 'recovery') {
          navigate('/reset-password', { replace: true })
        } else {
          navigate('/services', { replace: true })
        }
      } else {
        // No session after timeout — something went wrong
        navigate('/login', { replace: true })
      }
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-[#64748B]">Signing you in...</p>
      </div>
    </div>
  )
}
