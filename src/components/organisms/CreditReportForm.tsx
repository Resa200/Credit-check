import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creditReportSchema, type CreditReportFormValues } from '@/lib/validators'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'
import Tooltip from '@/components/atoms/Tooltip'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface CreditReportFormProps {
  onSubmit: (data: CreditReportFormValues) => void
  loading: boolean
}

const singleBureaus = [
  { id: 'crc', label: 'CRC Credit Bureau' },
  { id: 'firstcentral', label: 'FirstCentral' },
] as const

export default function CreditReportForm({ onSubmit, loading }: CreditReportFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreditReportFormValues>({ resolver: zodResolver(creditReportSchema) })

  const selectedBureau = watch('bureau')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormField
        label="BVN"
        fieldId="bvn"
        required
        placeholder="e.g. 22312345678"
        maxLength={11}
        inputMode="numeric"
        tooltip="Your BVN is used to retrieve your credit history from the bureau."
        error={errors.bvn?.message}
        {...register('bvn')}
      />

      <div>
        <div className="flex items-center gap-1 mb-2">
          <span className="block text-sm font-medium text-[#1E293B]">
            Credit Bureau <span className="text-[#F43F5E]">*</span>
          </span>
          <Tooltip content="CRC and FirstCentral are Nigeria's two major credit bureaus. Choose 'Combined' for the most comprehensive view." />
        </div>

        {/* Single bureau options */}
        <div className="grid grid-cols-2 gap-3">
          {singleBureaus.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setValue('bureau', b.id, { shouldValidate: true })}
              className={cn(
                'rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-150',
                selectedBureau === b.id
                  ? 'border-[#7C3AED] bg-[#EDE9FE] text-[#7C3AED]'
                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#7C3AED]/40'
              )}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Combined option — full width, special styling */}
        <button
          type="button"
          onClick={() => setValue('bureau', 'combined', { shouldValidate: true })}
          className={cn(
            'relative mt-3 w-full rounded-xl border-2 px-4 py-3.5 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2',
            selectedBureau === 'combined'
              ? 'border-[#7C3AED] bg-gradient-to-r from-[#EDE9FE] to-[#F5F3FF] text-[#7C3AED] shadow-sm shadow-[#7C3AED]/10'
              : 'border-[#E2E8F0] bg-gradient-to-r from-[#FAFAFA] to-white text-[#64748B] hover:border-[#7C3AED]/40'
          )}
        >
          <Sparkles size={15} className={selectedBureau === 'combined' ? 'text-[#7C3AED]' : 'text-[#94A3B8]'} />
          Combined Report
          <span className={cn(
            'absolute -top-2 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full',
            selectedBureau === 'combined'
              ? 'bg-[#7C3AED] text-white'
              : 'bg-[#EDE9FE] text-[#7C3AED]'
          )}>
            Recommended
          </span>
        </button>

        {errors.bureau && (
          <p className="text-xs text-[#F43F5E] mt-1.5">{errors.bureau.message}</p>
        )}
      </div>

      <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
        {selectedBureau === 'combined' ? 'Get Combined Report' : 'Get Credit Report'}
      </Button>
    </form>
  )
}
