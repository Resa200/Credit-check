import { useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'
import AppShell from '@/components/templates/AppShell'
import ServiceGrid from '@/components/organisms/ServiceGrid'
import { useAppStore } from '@/store/appStore'
import type { ServiceType } from '@/types/adjutor.types'

export default function Services() {
  const { selectService } = useAppStore()
  const navigate = useNavigate()

  function handleSelect(service: ServiceType) {
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

        <ServiceGrid onSelect={handleSelect} />
      </div>
    </AppShell>
  )
}
