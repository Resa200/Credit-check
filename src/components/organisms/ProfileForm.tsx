import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { profileSchema, type ProfileFormValues } from '@/lib/validators'
import { useProfile } from '@/hooks/useProfile'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'

export default function ProfileForm() {
  const { profile, updateProfile } = useProfile()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true)
    try {
      await updateProfile({
        full_name: data.full_name,
        phone: data.phone || undefined,
      })
      toast.success('Profile updated')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormField
        label="Email"
        fieldId="email"
        type="email"
        value={profile?.email ?? ''}
        disabled
        className="opacity-60"
      />

      <FormField
        label="Full Name"
        fieldId="full_name"
        type="text"
        error={errors.full_name?.message}
        required
        {...register('full_name')}
      />

      <FormField
        label="Phone"
        fieldId="phone"
        type="tel"
        placeholder="08012345678"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Button type="submit" loading={loading} disabled={!isDirty}>
        Save Changes
      </Button>
    </form>
  )
}
