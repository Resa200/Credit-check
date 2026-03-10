import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  className?: string
  children: React.ReactNode
}

export default function Badge({ variant = 'default', className, children }: BadgeProps) {
  const variants = {
    default: 'bg-[#EDE9FE] text-[#7C3AED]',
    success: 'bg-[#D1FAE5] text-[#059669]',
    error: 'bg-[#FFE4E6] text-[#F43F5E]',
    warning: 'bg-[#FEF3C7] text-[#D97706]',
    info: 'bg-[#E0F2FE] text-[#0284C7]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
