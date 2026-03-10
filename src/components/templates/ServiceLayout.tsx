import { ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

interface ServiceLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  showBack?: boolean
}

export default function ServiceLayout({
  title,
  subtitle,
  children,
  showBack = true,
}: ServiceLayoutProps) {
  const { goToServices } = useAppStore()

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      {showBack && (
        <button
          type="button"
          onClick={goToServices}
          className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#7C3AED] mb-6 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to services
        </button>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
        {children}
      </div>
    </div>
  )
}
