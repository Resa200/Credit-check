import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function useAIExplain() {
  const profile = useAuthStore((s) => s.profile)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startExplanation = useCallback(
    async (serviceType: string, resultData: Record<string, unknown>) => {
      if (!profile) {
        setError('Please sign in to use AI explanations')
        return
      }

      setLoading(true)
      setError(null)
      setMessages([])

      try {
        const { data, error: fnError } = await supabase.functions.invoke('explain-result', {
          body: {
            service_type: serviceType,
            result_data: resultData,
          },
        })

        if (fnError) {
          const msg = typeof fnError === 'object' && fnError.message
            ? fnError.message
            : JSON.stringify(fnError)
          throw new Error(msg)
        }
        if (data?.error) throw new Error(data.error)
        if (!data?.explanation) throw new Error('No explanation returned')

        const aiMessage: Message = { role: 'assistant', content: data.explanation }
        setMessages([aiMessage])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get AI explanation')
      } finally {
        setLoading(false)
      }
    },
    [profile]
  )

  const askFollowUp = useCallback(
    async (
      question: string,
      serviceType: string,
      resultData: Record<string, unknown>
    ) => {
      if (!profile) {
        setError('Please sign in to use AI explanations')
        return
      }

      const userMessage: Message = { role: 'user', content: question }
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setLoading(true)
      setError(null)

      try {
        const { data, error: fnError } = await supabase.functions.invoke('explain-result', {
          body: {
            service_type: serviceType,
            result_data: resultData,
            messages: updatedMessages,
          },
        })

        if (fnError) {
          const msg = typeof fnError === 'object' && fnError.message
            ? fnError.message
            : JSON.stringify(fnError)
          throw new Error(msg)
        }
        if (data?.error) throw new Error(data.error)
        if (!data?.explanation) throw new Error('No explanation returned')

        const aiMessage: Message = { role: 'assistant', content: data.explanation }
        setMessages((prev) => [...prev, aiMessage])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get AI response')
      } finally {
        setLoading(false)
      }
    },
    [profile, messages]
  )

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    loading,
    error,
    startExplanation,
    askFollowUp,
    clearChat,
  }
}
