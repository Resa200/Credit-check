import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  className?: string
}

export default function Tooltip({ content, className }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span className={cn('relative inline-flex items-center', className)}>
      <button
        type="button"
        className="text-[#94A3B8] hover:text-[#7C3AED] transition-colors p-0.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        aria-label="More information"
      >
        <HelpCircle size={15} />
      </button>

      {visible && (
        <span
          role="tooltip"
          className="absolute left-6 bottom-0 z-50 w-56 rounded-lg border border-[#E2E8F0] bg-white p-3 text-xs text-[#1E293B] shadow-lg leading-relaxed"
        >
          {content}
        </span>
      )}
    </span>
  )
}
