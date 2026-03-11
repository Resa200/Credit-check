import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bvnSchema, type BVNFormValues } from '@/lib/validators'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'

interface BVNFormProps {
  onSubmit: (data: BVNFormValues) => void
  loading: boolean
}

export default function BVNForm({ onSubmit, loading }: BVNFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BVNFormValues>({ resolver: zodResolver(bvnSchema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormField
        label="BVN"
        fieldId="bvn"
        required
        placeholder="e.g. 22312345678"
        maxLength={11}
        inputMode="numeric"
        tooltip="Your BVN is an 11-digit number. Dial *565*0# on your registered phone to find it."
        error={errors.bvn?.message}
        {...register('bvn')}
      />
      <FormField
        label="Email or Phone Number"
        fieldId="contact"
        required
        placeholder="e.g. john@email.com or 08012345678"
        tooltip="An OTP will be sent to the phone number or email registered to this BVN so it can be verified."
        error={errors.contact?.message}
        {...register('contact')}
      />
      <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
        Send OTP
      </Button>
    </form>
  )
}
