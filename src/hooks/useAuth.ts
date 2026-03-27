import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { createAuditLog } from '@/lib/audit'
import { fetchSubscription, fetchMonthlyLookupCount } from '@/hooks/useSubscription'
import type { UserRow } from '@/types/supabase.types'

async function fetchProfile(authId: string): Promise<UserRow | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .eq('deleted_flag', false)
    .maybeSingle()

  if (data) return data

  // Profile doesn't exist yet (OAuth user or trigger race condition)
  // Create it from the auth user metadata
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const meta = user.user_metadata ?? {}
  const fullName = meta.full_name ?? meta.name ?? ''
  const email = user.email ?? ''

  const { data: newProfile } = await supabase
    .from('users')
    .insert({
      auth_id: user.id,
      email,
      full_name: fullName,
      phone: null,
      avatar_url: meta.avatar_url ?? meta.picture ?? null,
    })
    .select()
    .maybeSingle()

  return newProfile
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

/** Load profile + subscription data into the store */
async function loadUserData(
  authId: string,
  store: ReturnType<typeof useAuthStore.getState>
) {
  try {
    const p = await fetchProfile(authId)
    store.setProfile(p)
    if (p) {
      Promise.all([
        fetchSubscription(p.id),
        fetchMonthlyLookupCount(p.id),
      ])
        .then(([sub, count]) => {
          store.setSubscription(sub)
          store.setMonthlyLookupCount(count)
        })
        .catch(() => {})

      const pending = store.pendingResult
      if (pending) {
        syncPendingResult(p, pending)
          .then(() => store.setPendingResult(null))
          .catch(() => store.setPendingResult(null))
      }
    }
  } catch {
    store.setProfile(null)
  }
}

/**
 * Call this ONCE in App.tsx to bootstrap the auth session.
 */
export function useAuthInit() {
  useEffect(() => {
    let mounted = true
    const store = useAuthStore.getState()

    // 1. Bootstrap from stored session (localStorage)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      store.setSession(session)
      store.setUser(session?.user ?? null)

      if (session?.user) {
        await loadUserData(session.user.id, store)
      }

      if (mounted) store.setLoading(false)
    }).catch(() => {
      if (mounted) store.setLoading(false)
    })

    // 2. Listen for subsequent auth changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Skip INITIAL_SESSION — already handled by getSession above
        if (event === 'INITIAL_SESSION') return
        if (!mounted) return

        store.setSession(session)
        store.setUser(session?.user ?? null)

        if (session?.user) {
          loadUserData(session.user.id, store)
        } else {
          store.setProfile(null)
          store.setSubscription(null)
          store.setMonthlyLookupCount(null as unknown as number)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])
}

/**
 * Read auth state and get auth actions. Safe to call from any component.
 */
export function useAuth() {
  const {
    session, user, profile, loading,
    setPendingResult, clear,
  } = useAuthStore()

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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
      fetchProfile(data.user.id)
        .then((p) => {
          if (p) {
            createAuditLog({
              userId: p.id,
              action: 'login',
              resourceType: 'users',
              resourceId: p.id,
            }).catch(() => {})
          }
        })
        .catch(() => {})
    }

    return data
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (profile) {
      createAuditLog({
        userId: profile.id,
        action: 'logout',
        resourceType: 'users',
        resourceId: profile.id,
      }).catch(() => {})
    }
    await supabase.auth.signOut()
    clear()
  }, [profile, clear])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
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

    const { data: { session } } = await supabase.auth.getSession()
    const { data, error } = await supabase.functions.invoke('delete-account', {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    })

    if (error) throw new Error(error.message)
    if (data?.error) throw new Error(data.error)

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
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    deleteAccount,
    setPendingResult,
  }
}
