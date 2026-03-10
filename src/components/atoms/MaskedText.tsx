import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { mask } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MaskedTextProps {
  value: string
  keepStart?: number
  keepEnd?: number
  className?: string
}

export default function MaskedText({
  value,
  keepStart = 3,
  keepEnd = 4,
  className,
}: MaskedTextProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono', className)}>
      <span>{revealed ? value : mask(value, keepStart, keepEnd)}</span>
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="text-[#94A3B8] hover:text-[#7C3AED] transition-colors flex-shrink-0"
        aria-label={revealed ? 'Hide value' : 'Reveal value'}
      >
        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </span>
  )
}
