import { Crown, Check } from 'lucide-react'
import PaystackButton from './PaystackButton'

interface UpgradePromptProps {
  onSuccess?: () => void
}

export default function UpgradePrompt({ onSuccess }: UpgradePromptProps) {
  return (
    <div className="rounded-xl border border-[#7C3AED]/20 bg-[#EDE9FE]/30 p-6 mb-8 flex flex-col items-center gap-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EDE9FE]">
        <Crown size={26} className="text-[#7C3AED]" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[#1E293B] mb-1">
          Upgrade to Pro
        </h3>
        <p className="text-sm text-[#64748B]">
          You've used all your free lookups this month. Subscribe for unlimited access.
        </p>
      </div>

      <div className="flex flex-col gap-2 text-left w-full max-w-xs">
        {[
          'Unlimited BVN, Account & Credit lookups',
          'Full lookup history & exports',
          'Priority access to new features',
        ].map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm text-[#1E293B]">
            <Check size={14} className="text-[#059669] shrink-0" />
            {feature}
          </div>
        ))}
      </div>

      <PaystackButton size="lg" className="w-full max-w-xs" onSuccess={onSuccess}>
        Subscribe Now
      </PaystackButton>

      <p className="text-xs text-[#94A3B8]">
        Cancel anytime. Billed monthly via Paystack.
      </p>
    </div>
  )
}
