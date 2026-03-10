import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import type { Bank } from '@/types/adjutor.types'
import { cn } from '@/lib/utils'
import Label from '@/components/atoms/Label'
import Tooltip from '@/components/atoms/Tooltip'

interface BankSelectorProps {
  banks: Bank[]
  value: string
  onChange: (bankCode: string) => void
  error?: string
  disabled?: boolean
}

export default function BankSelector({
  banks,
  value,
  onChange,
  error,
  disabled,
}: BankSelectorProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selected = banks.find((b) => b.code === value)

  const filtered = banks.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Label htmlFor="bank-selector" required>
          Bank
        </Label>
        <Tooltip content="Select the bank where this account is held." />
      </div>

      <div ref={ref} className="relative">
        <button
          id="bank-selector"
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'w-full flex items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-sm transition-all duration-150 outline-none',
            'focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20',
            error
              ? 'border-[#F43F5E] focus:border-[#F43F5E]'
              : 'border-[#E2E8F0]',
            disabled && 'opacity-50 cursor-not-allowed bg-[#FAFAFA]'
          )}
        >
          <span className={selected ? 'text-[#1E293B]' : 'text-[#94A3B8]'}>
            {selected ? selected.name : 'Select a bank…'}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              'text-[#94A3B8] transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-2">
              <Search size={14} className="text-[#94A3B8] flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search banks…"
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-[#94A3B8]"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-2 text-sm text-[#94A3B8]">
                  No banks found
                </li>
              ) : (
                filtered.map((bank) => (
                  <li key={bank.code}>
                    <button
                      type="button"
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm hover:bg-[#EDE9FE] transition-colors',
                        bank.code === value
                          ? 'bg-[#EDE9FE] text-[#7C3AED] font-medium'
                          : 'text-[#1E293B]'
                      )}
                      onClick={() => {
                        onChange(bank.code)
                        setOpen(false)
                        setQuery('')
                      }}
                    >
                      {bank.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-[#F43F5E] mt-0.5">{error}</p>
      )}
    </div>
  )
}
