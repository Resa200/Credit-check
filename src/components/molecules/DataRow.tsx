import { cn } from '@/lib/utils'

interface DataRowProps {
  label: string
  value: React.ReactNode
  className?: string
}

export default function DataRow({ label, value, className }: DataRowProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 py-3 border-b border-[#E2E8F0] last:border-0',
        className
      )}
    >
      <span className="text-sm text-[#94A3B8] whitespace-nowrap flex-shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium text-[#1E293B] text-right">
        {value || '—'}
      </span>
    </div>
  )
}
