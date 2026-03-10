import type { AccountData } from '@/types/adjutor.types'
import DataRow from '@/components/molecules/DataRow'
import StatusBadge from '@/components/molecules/StatusBadge'
import MaskedText from '@/components/atoms/MaskedText'
import Button from '@/components/atoms/Button'

interface AccountResultProps {
  data: AccountData
  onCheckAnother: () => void
  onBackToServices: () => void
}

export default function AccountResult({
  data,
  onCheckAnother,
  onBackToServices,
}: AccountResultProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <StatusBadge status="success" label="Account Verified" />
        <h2 className="text-xl font-bold text-[#1E293B]">{data.account_name}</h2>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
        <div className="px-5 py-3 bg-[#FAFAFA] border-b border-[#E2E8F0]">
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">
            Account Details
          </h3>
        </div>
        <div className="px-5">
          <DataRow label="Account Name" value={data.account_name} />
          <DataRow
            label="Account Number"
            value={
              <MaskedText value={data.account_number} keepStart={3} keepEnd={3} />
            }
          />
          <DataRow label="Bank Code" value={data.bank_code} />
          <DataRow
            label="Linked BVN"
            value={
              data.bvn
                ? <MaskedText value={data.bvn} keepStart={3} keepEnd={3} />
                : '—'
            }
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="flex-1" onClick={onCheckAnother}>
          Check Another Account
        </Button>
        <Button variant="ghost" className="flex-1" onClick={onBackToServices}>
          Back to Services
        </Button>
      </div>
    </div>
  )
}
