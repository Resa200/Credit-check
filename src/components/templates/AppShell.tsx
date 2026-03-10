import { Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-[#1E293B] tracking-tight">
              CreditCheck
            </span>
          </Link>
          <span className="text-xs text-[#94A3B8] hidden sm:block">
            Powered by Adjutor
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#94A3B8]">
            © {new Date().getFullYear()} CreditCheck · Powered by Adjutor
          </p>
          <p className="text-xs text-[#94A3B8]">
            Your data is never stored or shared.
          </p>
        </div>
      </footer>
    </div>
  )
}
