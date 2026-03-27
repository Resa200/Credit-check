import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, X, AlertCircle } from 'lucide-react'
import Button from '@/components/atoms/Button'
import { useAIExplain } from '@/hooks/useAIExplain'
import { useAuth } from '@/hooks/useAuth'

interface AIExplanationProps {
  serviceType: string
  resultData: Record<string, unknown>
}

export default function AIExplanation({ serviceType, resultData }: AIExplanationProps) {
  const { messages, loading, error, startExplanation, askFollowUp, clearChat } = useAIExplain()
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleOpen() {
    setOpen(true)
    if (messages.length === 0) {
      startExplanation(serviceType, resultData)
    }
  }

  function handleClose() {
    setOpen(false)
    clearChat()
  }

  function handleSend() {
    const trimmed = question.trim()
    if (!trimmed || loading) return
    askFollowUp(trimmed, serviceType, resultData)
    setQuestion('')
    inputRef.current?.focus()
  }

  if (!isAuthenticated) return null

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#EDE9FE]/50"
        onClick={handleOpen}
      >
        <Sparkles size={14} />
        Ask AI
      </Button>
    )
  }

  return (
    <div className="rounded-2xl border border-[#7C3AED]/20 bg-[#FAFAFE] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]">
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={14} />
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-white/70 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Chat messages */}
      <div className="max-h-80 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === 'assistant'
                ? 'text-sm text-[#1E293B] bg-white rounded-xl px-4 py-3 border border-[#E2E8F0] whitespace-pre-wrap'
                : 'text-sm text-white bg-[#7C3AED] rounded-xl px-4 py-3 self-end max-w-[85%]'
            }
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-[#94A3B8] px-1">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:300ms]" />
            </div>
            Thinking...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-[#F43F5E] bg-[#FFE4E6] rounded-xl px-4 py-3">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a follow-up question..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !question.trim()}
            className="px-3 py-2 rounded-lg bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
