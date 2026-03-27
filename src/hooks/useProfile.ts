import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { createAuditLog } from '@/lib/audit'
import type { UserRow } from '@/types/supabase.types'

export function useProfile() {
  const profile = useAuthStore((s) => s.profile)
  const setProfile = useAuthStore((s) => s.setProfile)

  const updateProfile = useCallback(
    async (updates: { full_name?: string; phone?: string; avatar_url?: string }) => {
      if (!profile) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          modified_by: profile.id,
          modified_on: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data as UserRow)

      await createAuditLog({
        userId: profile.id,
        action: 'profile_update',
        resourceType: 'users',
        resourceId: profile.id,
        details: { updated_fields: Object.keys(updates) },
      })

      return data
    },
    [profile, setProfile]
  )

  return { profile, updateProfile }
}
