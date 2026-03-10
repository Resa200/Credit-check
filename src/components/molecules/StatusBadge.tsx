import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning'
  label: string
  className?: string
}

const config = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#059669]',
    border: 'border-[#6EE7B7]',
  },
  error: {
    icon: XCircle,
    bg: 'bg-[#FFE4E6]',
    text: 'text-[#F43F5E]',
    border: 'border-[#FECDD3]',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#D97706]',
    border: 'border-[#FDE68A]',
  },
}

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const { icon: Icon, bg, text, border } = config[status]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2',
        bg,
        text,
        border,
        className
      )}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
