import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema, type AccountFormValues } from '@/lib/validators'
import FormField from '@/components/molecules/FormField'
import BankSelector from '@/components/molecules/BankSelector'
import Button from '@/components/atoms/Button'
import { useBankList } from '@/hooks/useBankList'
import Spinner from '@/components/atoms/Spinner'

interface AccountFormProps {
  onSubmit: (data: AccountFormValues) => void
  loading: boolean
}

export default function AccountForm({ onSubmit, loading }: AccountFormProps) {
  const { banks, loading: banksLoading } = useBankList()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormValues>({ resolver: zodResolver(accountSchema) })

  if (banksLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormField
        label="Account Number"
        fieldId="account_number"
        required
        placeholder="e.g. 0123456789"
        maxLength={10}
        inputMode="numeric"
        tooltip="Your 10-digit NUBAN account number printed on your bank card or statement."
        error={errors.account_number?.message}
        {...register('account_number')}
      />

      <Controller
        name="bank_code"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <BankSelector
            banks={banks}
            value={field.value}
            onChange={field.onChange}
            error={errors.bank_code?.message}
          />
        )}
      />

      <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
        Verify Account
      </Button>
    </form>
  )
}
