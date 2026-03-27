import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { useSubscription } from '@/hooks/useSubscription'
import type { CommandIntent } from '@/types/commandBar.types'

export const SUGGESTIONS = [
  'Go to BVN lookup',
  'Start a credit report',
  'Show my lookup history',
  'How many lookups do I have left?',
  'Show failed lookups from last week',
  'Go to my subscription',
]

export function useCommandBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [intent, setIntent] = useState<CommandIntent | null>(null)
  const [parsedQuery, setParsedQuery] = useState('')  // the query that produced the current intent
  const navigate = useNavigate()
  const selectService = useAppStore((s) => s.selectService)
  const profile = useAuthStore((s) => s.profile)
  const session = useAuthStore((s) => s.session)
  const { monthlyLookupCount, freeLimit, isActive, remainingFreeQuota } = useSubscription()

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  function close() {
    setIsOpen(false)
    setQuery('')
    setIntent(null)
    setParsedQuery('')
    setError(null)
  }

  function open() {
    setIsOpen(true)
    setQuery('')
    setIntent(null)
    setParsedQuery('')
    setError(null)
  }

  const parseCommand = useCallback(async (command: string) => {
    if (!command.trim()) return

    setLoading(true)
    setError(null)
    setIntent(null)

    try {
      const userContext = {
        isAuthenticated: !!session && !!profile,
        isActive,
        monthlyLookupCount,
        freeLimit,
        remainingFreeQuota,
        currentPath: window.location.pathname,
      }

      const { data, error: fnError } = await supabase.functions.invoke('command-bar', {
        body: { command, user_context: userContext },
      })

      if (fnError) throw new Error(typeof fnError === 'object' && fnError.message ? fnError.message : 'Failed to parse command')
      if (data?.error) throw new Error(data.error)
      if (!data?.intent) throw new Error('No intent returned')

      setIntent(data.intent as CommandIntent)
      setParsedQuery(command)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }, [session, profile, isActive, monthlyLookupCount, freeLimit, remainingFreeQuota])

  const executeIntent = useCallback((intentToExec?: CommandIntent) => {
    const i = intentToExec ?? intent
    if (!i) return

    switch (i.type) {
      case 'navigate':
        navigate(i.path)
        break

      case 'start_service':
        selectService(i.service)
        navigate('/verify')
        break

      case 'filter_history': {
        const params = new URLSearchParams({ tab: 'history' })
        if (i.filters.serviceType) params.set('serviceType', i.filters.serviceType)
        if (i.filters.status) params.set('status', i.filters.status)
        if (i.filters.dateFrom) params.set('dateFrom', i.filters.dateFrom)
        if (i.filters.dateTo) params.set('dateTo', i.filters.dateTo)
        navigate(`/profile?${params.toString()}`)
        break
      }

      case 'answer':
      case 'unknown':
        // These are displayed inline, no navigation
        return
    }

    close()
  }, [intent, navigate, selectService])

  return {
    isOpen,
    open,
    close,
    query,
    setQuery,
    loading,
    error,
    intent,
    parsedQuery,
    parseCommand,
    executeIntent,
  }
}
