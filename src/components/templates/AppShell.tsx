import { Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import UserMenu from '@/components/molecules/UserMenu'
import Button from '@/components/atoms/Button'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, loading } = useAuth()

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
          <div className="flex items-center gap-3">
            {!loading && (
              isAuthenticated ? (
                <UserMenu />
              ) : (
                <Link to="/login">
                  <Button size="sm" variant="outline">
                    Sign In
                  </Button>
                </Link>
              )
            )}
          </div>
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
            &copy; {new Date().getFullYear()} CreditCheck &middot; Powered by Adjutor
          </p>
          <p className="text-xs text-[#94A3B8]">
            {isAuthenticated
              ? 'Your data is securely stored in your account.'
              : 'Sign in to save your verification history.'}
          </p>
        </div>
      </footer>
    </div>
  )
}
