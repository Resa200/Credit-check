import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/atoms/Button'
import UserMenu from '@/components/molecules/UserMenu'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C3AED] shadow-md shadow-[#7C3AED]/20">
            <Shield size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-[#1E293B] tracking-tight">
            CreditCheck
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#64748B] hover:text-[#7C3AED] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {!loading && (
            isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login">
                  <Button size="sm" variant="ghost">Sign In</Button>
                </Link>
                <Link to="/verify">
                  <Button size="sm" className="shadow-md shadow-[#7C3AED]/20">
                    Get Started
                  </Button>
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[#64748B] hover:text-[#1E293B]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-[#E2E8F0] px-4 pb-4"
        >
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-[#64748B] hover:text-[#7C3AED] py-2"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2 border-t border-[#E2E8F0]">
              {!loading && !isAuthenticated && (
                <>
                  <Link to="/login" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/verify" className="flex-1">
                    <Button size="sm" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
