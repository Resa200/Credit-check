import type { BVNData } from '@/types/adjutor.types'
import { buildFullName, formatDate } from '@/lib/utils'
import DataRow from '@/components/molecules/DataRow'
import StatusBadge from '@/components/molecules/StatusBadge'
import MaskedText from '@/components/atoms/MaskedText'
import Button from '@/components/atoms/Button'
import { capitalise } from '@/lib/utils'

interface BVNResultProps {
  data: BVNData
  onCheckAnother: () => void
  onBackToServices: () => void
}

export default function BVNResult({ data, onCheckAnother, onBackToServices }: BVNResultProps) {
  const fullName = buildFullName(data.first_name, data.middle_name, data.last_name)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        {data.image_url && (
          <img
            src={data.image_url}
            alt="BVN profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-[#E2E8F0]"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
        <StatusBadge status="success" label="BVN Verified" />
        <h2 className="text-xl font-bold text-[#1E293B]">{fullName}</h2>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
        <div className="px-5 py-3 bg-[#FAFAFA] border-b border-[#E2E8F0]">
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">
            Identity Details
          </h3>
        </div>
        <div className="px-5">
          <DataRow label="Full Name" value={fullName} />
          <DataRow
            label="BVN"
            value={<MaskedText value={data.bvn} keepStart={3} keepEnd={3} />}
          />
          <DataRow label="Date of Birth" value={formatDate(data.dob)} />
          <DataRow
            label="Phone"
            value={<MaskedText value={data.mobile} keepStart={4} keepEnd={3} />}
          />
          <DataRow
            label="Email"
            value={
              data.email
                ? <MaskedText value={data.email} keepStart={2} keepEnd={8} />
                : '—'
            }
          />
          <DataRow label="Gender" value={capitalise(data.gender)} />
          <DataRow label="State" value={capitalise(data.state_of_residence)} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="flex-1" onClick={onCheckAnother}>
          Check Another BVN
        </Button>
        <Button variant="ghost" className="flex-1" onClick={onBackToServices}>
          Back to Services
        </Button>
      </div>
    </div>
  )
}
