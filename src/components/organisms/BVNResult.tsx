import type { BVNData } from '@/types/adjutor.types'
import { buildFullName, formatDate, capitalise } from '@/lib/utils'
import DataRow from '@/components/molecules/DataRow'
import StatusBadge from '@/components/molecules/StatusBadge'
import MaskedText from '@/components/atoms/MaskedText'
import Button from '@/components/atoms/Button'
import { ShieldAlert, ShieldCheck, Download, FileJson, Mail } from 'lucide-react'
import { useExport } from '@/hooks/useExport'
import { useAuth } from '@/hooks/useAuth'

interface BVNResultProps {
  data: BVNData
  onCheckAnother: () => void
  onBackToServices: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
      <div className="px-5 py-3 bg-[#FAFAFA] border-b border-[#E2E8F0]">
        <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="px-5">{children}</div>
    </div>
  )
}

function resolveImage(data: BVNData): string | null {
  if (data.base64Image) {
    const prefix = data.base64Image.startsWith('data:')
      ? ''
      : 'data:image/jpeg;base64,'
    return `${prefix}${data.base64Image}`
  }
  if (data.image_url) return data.image_url
  return null
}

export default function BVNResult({ data, onCheckAnother, onBackToServices }: BVNResultProps) {
  const { exportBVNPDF, exportResultJSON, emailResult } = useExport()
  const { isAuthenticated } = useAuth()
  const fullName = buildFullName(data.first_name, data.middle_name, data.last_name)
  const photo = resolveImage(data)
  const dob = data.formatted_dob || data.dob

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        {photo ? (
          <img
            src={photo}
            alt="BVN profile photo"
            className="w-20 h-20 rounded-full object-cover border-2 border-[#E2E8F0] shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#EDE9FE] flex items-center justify-center border-2 border-[#E2E8F0]">
            <span className="text-2xl font-bold text-[#7C3AED]">
              {data.first_name?.[0] ?? '?'}
            </span>
          </div>
        )}
        <StatusBadge status="success" label="BVN Verified" />
        <div>
          <h2 className="text-xl font-bold text-[#1E293B]">{fullName}</h2>
          {data.name_on_card && data.name_on_card !== fullName && (
            <p className="text-xs text-[#94A3B8] mt-0.5">Card name: {data.name_on_card}</p>
          )}
        </div>

        {/* Watchlist status */}
        {data.watchlisted != null && (
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
            data.watchlisted
              ? 'bg-[#FFE4E6] text-[#F43F5E]'
              : 'bg-[#D1FAE5] text-[#059669]'
          }`}>
            {data.watchlisted
              ? <><ShieldAlert size={13} /> Watchlisted</>
              : <><ShieldCheck size={13} /> Not Watchlisted</>
            }
          </div>
        )}
      </div>

      {/* Identity */}
      <Section title="Identity">
        <DataRow label="BVN" value={<MaskedText value={data.bvn} keepStart={3} keepEnd={3} />} />
        <DataRow label="Full Name" value={fullName} />
        <DataRow label="Date of Birth" value={formatDate(dob)} />
        <DataRow label="Gender" value={capitalise(data.gender)} />
        {data.marital_status && (
          <DataRow label="Marital Status" value={capitalise(data.marital_status)} />
        )}
        {data.nationality && (
          <DataRow label="Nationality" value={capitalise(data.nationality)} />
        )}
        {data.nin && (
          <DataRow label="NIN" value={<MaskedText value={data.nin} keepStart={3} keepEnd={3} />} />
        )}
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <DataRow
          label="Phone"
          value={<MaskedText value={data.mobile} keepStart={4} keepEnd={3} />}
        />
        {data.mobile2 && (
          <DataRow
            label="Alt. Phone"
            value={<MaskedText value={data.mobile2} keepStart={4} keepEnd={3} />}
          />
        )}
        {data.email && (
          <DataRow
            label="Email"
            value={<MaskedText value={data.email} keepStart={2} keepEnd={10} />}
          />
        )}
        {data.residential_address && (
          <DataRow label="Address" value={data.residential_address} />
        )}
      </Section>

      {/* Location */}
      <Section title="Location">
        {data.state_of_origin && (
          <DataRow label="State of Origin" value={capitalise(data.state_of_origin)} />
        )}
        {data.lga_of_origin && (
          <DataRow label="LGA of Origin" value={capitalise(data.lga_of_origin)} />
        )}
        {data.state_of_residence && (
          <DataRow label="State of Residence" value={capitalise(data.state_of_residence)} />
        )}
        {data.lga_of_residence && (
          <DataRow label="LGA of Residence" value={capitalise(data.lga_of_residence)} />
        )}
      </Section>

      {/* Enrollment */}
      <Section title="Bank Enrollment">
        {data.registration_date && (
          <DataRow label="Registration Date" value={data.registration_date} />
        )}
        {data.enrollment_bank && (
          <DataRow label="Enrollment Bank" value={data.enrollment_bank} />
        )}
        {data.enrollment_branch && (
          <DataRow label="Enrollment Branch" value={capitalise(data.enrollment_branch)} />
        )}
        {data.level_of_account && (
          <DataRow label="Account Level" value={capitalise(data.level_of_account)} />
        )}
      </Section>

      {/* Export Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => exportBVNPDF(data)}
        >
          <Download size={14} />
          Download PDF
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => exportResultJSON('bvn', data as unknown as Record<string, unknown>)}
        >
          <FileJson size={14} />
          Download JSON
        </Button>
        {isAuthenticated && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => emailResult('bvn', data as unknown as Record<string, unknown>)}
          >
            <Mail size={14} />
            Email to Me
          </Button>
        )}
      </div>

      {/* Actions */}
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
