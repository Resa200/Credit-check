import { useRef, useEffect } from 'react'
import { Command, Search, ArrowRight, Sparkles, AlertCircle, Navigation, Play, Filter, MessageSquare, X } from 'lucide-react'
import { useCommandBar, SUGGESTIONS } from '@/hooks/useCommandBar'
import { cn } from '@/lib/utils'
import type { CommandIntent } from '@/types/commandBar.types'

function IntentIcon({ type }: { type: CommandIntent['type'] }) {
  switch (type) {
    case 'navigate':
      return <Navigation size={16} className="text-[#7C3AED]" />
    case 'start_service':
      return <Play size={16} className="text-[#059669]" />
    case 'filter_history':
      return <Filter size={16} className="text-[#0EA5E9]" />
    case 'answer':
      return <MessageSquare size={16} className="text-[#7C3AED]" />
    case 'unknown':
      return <AlertCircle size={16} className="text-[#94A3B8]" />
  }
}

function IntentPreview({ intent, onExecute }: { intent: CommandIntent; onExecute: () => void }) {
  if (intent.type === 'answer') {
    return (
      <div className="px-4 py-3 border-l-2 border-[#7C3AED] bg-[#F5F3FF] rounded-r-lg">
        <p className="text-sm text-[#1E293B] leading-relaxed">{intent.text}</p>
      </div>
    )
  }

  if (intent.type === 'unknown') {
    return (
      <div className="px-4 py-3 bg-[#F8FAFC] rounded-lg">
        <p className="text-sm text-[#64748B]">{intent.text || "I didn't understand that. Try one of the suggestions below."}</p>
      </div>
    )
  }

  const label = intent.label || 'Execute action'

  return (
    <button
      type="button"
      onClick={onExecute}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EDE9FE]/30 hover:border-[#7C3AED]/30 transition-colors group text-left"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-[#E2E8F0] shrink-0 group-hover:border-[#7C3AED]/30">
        <IntentIcon type={intent.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1E293B]">{label}</p>
        <p className="text-xs text-[#94A3B8]">
          {intent.type === 'filter_history' && 'Will navigate to history with filters applied'}
          {intent.type === 'navigate' && 'Will navigate to this page'}
          {intent.type === 'start_service' && 'Will open the verification form'}
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] group-hover:text-[#7C3AED] transition-colors">
        <span className="hidden sm:inline">Enter</span>
        <ArrowRight size={14} />
      </div>
    </button>
  )
}

export default function CommandBar() {
  const {
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
  } = useCommandBar()

  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const queryChanged = query.trim() !== parsedQuery.trim()
      if (queryChanged && query.trim()) {
        // User changed the query — parse the new one
        parseCommand(query)
      } else if (intent && intent.type !== 'answer' && intent.type !== 'unknown') {
        // Same query, execute the existing intent
        executeIntent()
      } else if (query.trim()) {
        parseCommand(query)
      }
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setQuery(suggestion)
    parseCommand(suggestion)
  }

  if (!isOpen) {
    return (
      <>
        {/* Floating trigger button */}
        <button
          type="button"
          onClick={open}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/25 hover:bg-[#6D28D9] hover:shadow-xl hover:shadow-[#7C3AED]/30 transition-all group"
        >
          <Command size={16} />
          <span className="text-sm font-medium hidden sm:inline">Command</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/20 text-[11px] font-mono">
            ⌘K
          </kbd>
        </button>
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal — positioned in upper third */}
      <div className="relative flex justify-center pt-[15vh] px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2 shrink-0">
              <Sparkles size={16} className="text-[#7C3AED]" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                // Clear previous intent when typing
                if (intent) {
                  // Intentionally not clearing — let user see previous result until new submit
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... &quot;Show failed lookups from last week&quot;"
              className="flex-1 text-sm text-[#1E293B] placeholder:text-[#94A3B8] bg-transparent outline-none"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); }}
                  className="p-1 rounded text-[#94A3B8] hover:text-[#1E293B] transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[10px] font-mono text-[#94A3B8] border border-[#E2E8F0]">
                ESC
              </kbd>
            </div>
          </div>

          {/* Content area */}
          <div className="max-h-80 overflow-y-auto p-4 flex flex-col gap-3">
            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-2.5 py-3 justify-center">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-sm text-[#94A3B8]">Thinking...</span>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="flex items-center gap-2 text-sm text-[#F43F5E] bg-[#FFE4E6] rounded-xl px-4 py-3">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Intent result */}
            {intent && !loading && (
              <IntentPreview intent={intent} onExecute={() => executeIntent()} />
            )}

            {/* Suggestions — show when no intent and not loading */}
            {!intent && !loading && !error && (
              <>
                <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider px-1">
                  {query ? 'Press Enter to search' : 'Try saying...'}
                </p>
                {!query && (
                  <div className="flex flex-col gap-1">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[#F8FAFC] transition-colors group"
                      >
                        <Search size={13} className="text-[#94A3B8] group-hover:text-[#7C3AED] transition-colors shrink-0" />
                        <span className="text-sm text-[#64748B] group-hover:text-[#1E293B] transition-colors">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Show suggestions after unknown intent */}
            {intent?.type === 'unknown' && !loading && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTIONS.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[#7C3AED]/20 text-[#7C3AED] bg-[#EDE9FE]/30 hover:bg-[#EDE9FE]/60 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-[#E2E8F0] bg-[#FAFAFA] flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white border border-[#E2E8F0] font-mono">↵</kbd>
                {intent && intent.type !== 'answer' && intent.type !== 'unknown' ? 'to execute' : 'to search'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white border border-[#E2E8F0] font-mono">esc</kbd>
                to close
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
              <Sparkles size={10} className="text-[#7C3AED]" />
              AI-powered
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
