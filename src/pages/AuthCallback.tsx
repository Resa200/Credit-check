import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Spinner from '@/components/atoms/Spinner'

/**
 * Handles Supabase auth redirects (email confirmation, password reset).
 * Supabase appends a `code` query param that must be exchanged for a session.
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          navigate('/login', { replace: true })
          return
        }
      }

      // Check the type param to decide where to redirect
      const type = params.get('type')
      if (type === 'recovery') {
        navigate('/reset-password', { replace: true })
      } else {
        // Email confirmation or other — go to services
        navigate('/services', { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-[#64748B]">Verifying...</p>
      </div>
    </div>
  )
}
