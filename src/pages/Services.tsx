import { useNavigate, Link } from 'react-router-dom'
import { Info, Lock } from 'lucide-react'
import AppShell from '@/components/templates/AppShell'
import ServiceGrid from '@/components/organisms/ServiceGrid'
import Button from '@/components/atoms/Button'
import { useAppStore } from '@/store/appStore'
import { useAuth } from '@/hooks/useAuth'
import type { ServiceType } from '@/types/adjutor.types'

export default function Services() {
  const { selectService, guestLookupUsed } = useAppStore()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const guestBlocked = !isAuthenticated && guestLookupUsed

  function handleSelect(service: ServiceType) {
    if (guestBlocked) {
      navigate('/login')
      return
    }
    selectService(service)
    navigate('/verify')
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Consent notice */}
        <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#EDE9FE]/40 p-4 mb-8">
          <Info size={16} className="text-[#7C3AED] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#64748B] leading-relaxed">
            By proceeding, you confirm that you are verifying your own details or
            have explicit permission from the individual whose information you are
            checking. All lookups are compliant with NDPR data privacy requirements.
          </p>
        </div>

        {/* Guest blocked banner */}
        {guestBlocked && (
          <div className="rounded-xl border border-[#7C3AED]/20 bg-[#EDE9FE]/30 p-6 mb-8 flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDE9FE]">
              <Lock size={22} className="text-[#7C3AED]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1E293B] mb-1">
                Sign in to continue
              </h3>
              <p className="text-sm text-[#64748B]">
                You've used your free lookup. Create an account or sign in to perform unlimited verifications and save your history.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/login">
                <Button>Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline">Create Account</Button>
              </Link>
            </div>
          </div>
        )}

        <ServiceGrid onSelect={handleSelect} />
      </div>
    </AppShell>
  )
}
