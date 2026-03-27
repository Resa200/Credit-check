import { Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = {
  Product: [
    { label: 'BVN Lookup', href: '/verify' },
    { label: 'Account Verification', href: '/verify' },
    { label: 'Credit Report', href: '/verify' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Status', href: '#' },
  ],
}

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0]">
      {/* Accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent opacity-30" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]">
                <Shield size={16} className="text-white" />
              </div>
              <span className="font-bold text-[#1E293B] tracking-tight">
                CreditCheck
              </span>
            </Link>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Self-service financial verification for everyone.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-[#1E293B] mb-4">
                {title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-sm text-[#64748B] hover:text-[#7C3AED] transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-[#64748B] hover:text-[#7C3AED] transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#94A3B8]">
            &copy; {new Date().getFullYear()} CreditCheck. All rights reserved.
          </p>
          <p className="text-xs text-[#94A3B8]">
            Powered by Adjutor
          </p>
        </div>
      </div>
    </footer>
  )
}
