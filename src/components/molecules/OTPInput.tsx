import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  value: string
  onChange: (val: string) => void
  error?: string
}

export default function OTPInput({ value, onChange, error }: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const digits = value.padEnd(6, '').split('').slice(0, 6)

  function handleChange(index: number, char: string) {
    if (!/^\d?$/.test(char)) return
    const next = [...digits]
    next[index] = char
    onChange(next.join('').slice(0, 6))
    if (char && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, 5)
    inputs.current[focusIndex]?.focus()
  }

  return (
    <div>
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={cn(
              'w-11 h-12 text-center text-lg font-semibold rounded-lg border bg-white outline-none transition-all duration-150',
              'focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20',
              error
                ? 'border-[#F43F5E]'
                : digits[i]
                ? 'border-[#7C3AED]'
                : 'border-[#E2E8F0]'
            )}
          />
        ))}
      </div>
      {error && (
        <p className="text-xs text-[#F43F5E] text-center mt-2">{error}</p>
      )}
    </div>
  )
}
