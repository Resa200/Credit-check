import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, X, AlertCircle, RotateCcw } from 'lucide-react'
import Button from '@/components/atoms/Button'
import { useAIExplain } from '@/hooks/useAIExplain'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface AIExplanationProps {
  serviceType: string
  resultData: Record<string, unknown>
}

const SUGGESTIONS: Record<string, string[]> = {
  bvn: [
    'Am I eligible for loans?',
    'How do I upgrade my account tier?',
    'What does my watchlist status mean?',
  ],
  account: [
    'Is this account safe for large transfers?',
    'Should I open a different account?',
    'How do I link my BVN?',
  ],
  credit: [
    'How can I improve my score?',
    'What loans can I get right now?',
    'Which debts should I pay first?',
    'How long will it take to improve?',
  ],
}

/** Renders markdown-like text with bold and headers */
function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={i} className="h-1.5" />

        // ## Header
        if (trimmed.startsWith('## ')) {
          return (
            <p key={i} className="text-xs font-bold text-[#7C3AED] uppercase tracking-wide mt-2 mb-0.5">
              {trimmed.slice(3)}
            </p>
          )
        }

        // Bold **text** and bullet points
        const formatted = trimmed.replace(
          /\*\*(.+?)\*\*/g,
          '<strong class="font-semibold text-[#1E293B]">$1</strong>'
        )

        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ')
        const text = isBullet ? formatted.slice(2) : formatted

        return (
          <p
            key={i}
            className={cn(
              'text-sm leading-relaxed text-[#334155]',
              isBullet && 'pl-3 relative before:content-["•"] before:absolute before:left-0 before:text-[#7C3AED] before:font-bold'
            )}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )
      })}
    </div>
  )
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

  function handleSend(text?: string) {
    const trimmed = (text ?? question).trim()
    if (!trimmed || loading) return
    askFollowUp(trimmed, serviceType, resultData)
    setQuestion('')
    inputRef.current?.focus()
  }

  function handleRestart() {
    clearChat()
    startExplanation(serviceType, resultData)
  }

  if (!isAuthenticated) return null

  const suggestions = SUGGESTIONS[serviceType] ?? SUGGESTIONS.bvn
  const showSuggestions = messages.length > 0 && messages.length <= 2 && !loading

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#7C3AED]/20 bg-gradient-to-r from-[#EDE9FE]/40 to-[#F5F3FF]/60 hover:from-[#EDE9FE]/70 hover:to-[#F5F3FF] transition-all group"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3AED] shadow-sm group-hover:shadow-md transition-shadow">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-[#1E293B]">AI Credit Advisor</p>
          <p className="text-xs text-[#94A3B8]">Get personalized advice based on your results</p>
        </div>
        <span className="text-xs font-medium text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-full">
          Ask AI
        </span>
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-[#7C3AED]/20 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]">
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={14} />
          <span className="text-sm font-semibold">AI Credit Advisor</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRestart}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Start over"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="max-h-96 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              msg.role === 'assistant'
                ? 'bg-[#FAFAFE] rounded-2xl px-4 py-3 border border-[#E2E8F0]'
                : 'text-sm text-white bg-[#7C3AED] rounded-2xl px-4 py-3 self-end max-w-[85%]'
            )}
          >
            {msg.role === 'assistant' ? (
              <FormattedMessage content={msg.content} />
            ) : (
              msg.content
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 text-sm text-[#94A3B8] px-2 py-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:300ms]" />
            </div>
            Analyzing your data...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-[#F43F5E] bg-[#FFE4E6] rounded-xl px-4 py-3">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Suggestion chips */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSend(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-[#7C3AED]/20 text-[#7C3AED] bg-[#EDE9FE]/30 hover:bg-[#EDE9FE]/60 transition-colors"
              >
                {s}
              </button>
            ))}
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
            placeholder="Ask for advice..."
            className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED] transition-colors"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !question.trim()}
            className="px-3.5 py-2.5 rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
