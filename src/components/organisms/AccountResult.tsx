import type { AccountData } from '@/types/adjutor.types'
import DataRow from '@/components/molecules/DataRow'
import StatusBadge from '@/components/molecules/StatusBadge'
import MaskedText from '@/components/atoms/MaskedText'
import Button from '@/components/atoms/Button'
import { Download, FileJson, Mail } from 'lucide-react'
import { useExport } from '@/hooks/useExport'
import { useAuth } from '@/hooks/useAuth'
import AIExplanation from '@/components/molecules/AIExplanation'
import ShareResult from '@/components/molecules/ShareResult'
import FeatureGate from '@/components/molecules/FeatureGate'

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
  const { exportAccountPDF, exportResultJSON, emailResult } = useExport()
  const { isAuthenticated } = useAuth()

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

      {/* Export Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <FeatureGate feature="pdf_export" mode="overlay" className="flex-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => exportAccountPDF(data)}
          >
            <Download size={14} />
            Download PDF
          </Button>
        </FeatureGate>
        <FeatureGate feature="json_export" mode="overlay" className="flex-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => exportResultJSON('account', data as unknown as Record<string, unknown>)}
          >
            <FileJson size={14} />
            Download JSON
          </Button>
        </FeatureGate>
        {isAuthenticated && (
          <FeatureGate feature="email_export" mode="overlay" className="flex-1">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => emailResult('account', data as unknown as Record<string, unknown>)}
            >
              <Mail size={14} />
              Email to Me
            </Button>
          </FeatureGate>
        )}
      </div>

      {/* Share */}
      <ShareResult
        serviceType="account"
        resultData={data as unknown as Record<string, unknown>}
      />

      {/* AI Explanation */}
      <FeatureGate feature="ai_advisor" mode="replace">
        <AIExplanation
          serviceType="account"
          resultData={data as unknown as Record<string, unknown>}
        />
      </FeatureGate>

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
