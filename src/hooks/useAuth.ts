import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { createAuditLog } from '@/lib/audit'
import type { UserRow } from '@/types/supabase.types'

async function fetchProfile(authId: string): Promise<UserRow | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .eq('deleted_flag', false)
    .single()
  return data
}

async function syncPendingResult(profile: UserRow, pending: {
  serviceType: 'bvn' | 'account' | 'credit'
  requestPayload: Record<string, unknown>
  responsePayload: Record<string, unknown>
}) {
  const { data: lookup } = await supabase
    .from('data_lookup_requests')
    .insert({
      user_id: profile.id,
      service_type: pending.serviceType,
      request_payload: pending.requestPayload,
      response_payload: pending.responsePayload,
      status: 'success' as const,
      adjutor_reference: null,
      meta: null,
      created_by: profile.id,
      modified_by: profile.id,
    })
    .select('id')
    .single()

  if (lookup) {
    await createAuditLog({
      userId: profile.id,
      action: `${pending.serviceType}_lookup`,
      resourceType: 'data_lookup_requests',
      resourceId: lookup.id,
      details: { synced_after_auth: true },
    })
  }
}

export function useAuth() {
  const {
    session, user, profile, loading,
    setSession, setUser, setProfile, setLoading,
    setPendingResult, clear,
  } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          const p = await fetchProfile(session.user.id)
          setProfile(p)

          // Sync pending result after login/signup
          const pending = useAuthStore.getState().pendingResult
          if (p && pending) {
            await syncPendingResult(p, pending)
            setPendingResult(null)
          }
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setSession, setUser, setProfile, setLoading, setPendingResult])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    if (data.user) {
      const p = await fetchProfile(data.user.id)
      if (p) {
        await createAuditLog({
          userId: p.id,
          action: 'login',
          resourceType: 'users',
          resourceId: p.id,
        })
      }
    }

    return data
  }, [])

  const signOut = useCallback(async () => {
    if (profile) {
      await createAuditLog({
        userId: profile.id,
        action: 'logout',
        resourceType: 'users',
        resourceId: profile.id,
      })
    }
    await supabase.auth.signOut()
    clear()
  }, [profile, clear])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }, [])

  const deleteAccount = useCallback(async () => {
    if (!profile) return

    await createAuditLog({
      userId: profile.id,
      action: 'account_delete',
      resourceType: 'users',
      resourceId: profile.id,
    })

    await supabase
      .from('users')
      .update({
        deleted_flag: true,
        deleted_on: new Date().toISOString(),
        deleted_by: profile.id,
      })
      .eq('id', profile.id)

    await supabase.auth.signOut()
    clear()
  }, [profile, clear])

  return {
    session,
    user,
    profile,
    loading,
    isAuthenticated: !!session && !!profile,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    deleteAccount,
    setPendingResult,
  }
}
