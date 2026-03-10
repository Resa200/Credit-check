import { Fingerprint, Building2, FileText } from 'lucide-react'
import ServiceCard from '@/components/molecules/ServiceCard'
import type { ServiceType } from '@/types/adjutor.types'

interface ServiceGridProps {
  onSelect: (service: ServiceType) => void
}

const services = [
  {
    id: 'bvn' as ServiceType,
    icon: Fingerprint,
    title: 'BVN Lookup',
    description:
      'Retrieve your name, date of birth, phone, and photo linked to your Bank Verification Number.',
    badge: 'Requires OTP consent',
  },
  {
    id: 'account' as ServiceType,
    icon: Building2,
    title: 'Account Verification',
    description:
      'Confirm that a bank account belongs to you and retrieve the registered account name instantly.',
    badge: 'Instant result',
  },
  {
    id: 'credit' as ServiceType,
    icon: FileText,
    title: 'Credit Report',
    description:
      'Pull your full credit bureau report from CRC or FirstCentral and download it as a PDF.',
    badge: 'Downloads as PDF',
  },
]

export default function ServiceGrid({ onSelect }: ServiceGridProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1E293B]">What would you like to verify?</h2>
        <p className="text-[#64748B] mt-2 text-sm">
          Select a service below. No account or login needed.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <ServiceCard
            key={s.id}
            icon={s.icon}
            title={s.title}
            description={s.description}
            badge={s.badge}
            onSelect={() => onSelect(s.id)}
          />
        ))}
      </div>
    </div>
  )
}
