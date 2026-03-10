import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface ServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  badge: string
  onSelect: () => void
  disabled?: boolean
}

export default function ServiceCard({
  icon: Icon,
  title,
  description,
  badge,
  onSelect,
  disabled,
}: ServiceCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'group w-full text-left rounded-2xl border border-[#E2E8F0] bg-white p-6',
        'hover:border-[#7C3AED] hover:shadow-md transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDE9FE] group-hover:bg-[#7C3AED] transition-colors duration-200">
          <Icon
            size={22}
            className="text-[#7C3AED] group-hover:text-white transition-colors duration-200"
          />
        </div>
        <ArrowRight
          size={18}
          className="text-[#94A3B8] group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-all duration-200 mt-1"
        />
      </div>

      <h3 className="text-base font-semibold text-[#1E293B] mb-1.5">{title}</h3>
      <p className="text-sm text-[#64748B] leading-relaxed mb-4">{description}</p>

      <span className="inline-flex items-center rounded-full bg-[#FAFAFA] border border-[#E2E8F0] px-2.5 py-0.5 text-xs text-[#64748B]">
        {badge}
      </span>
    </button>
  )
}
