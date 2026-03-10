import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creditReportSchema, type CreditReportFormValues } from '@/lib/validators'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'
import Tooltip from '@/components/atoms/Tooltip'
import { cn } from '@/lib/utils'

interface CreditReportFormProps {
  onSubmit: (data: CreditReportFormValues) => void
  loading: boolean
}

const bureaus = [
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
          <Tooltip content="CRC and FirstCentral are Nigeria's two major credit bureaus. Your report may differ slightly between them." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {bureaus.map((b) => (
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
        {errors.bureau && (
          <p className="text-xs text-[#F43F5E] mt-1.5">{errors.bureau.message}</p>
        )}
      </div>

      <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
        Get Credit Report
      </Button>
    </form>
  )
}
