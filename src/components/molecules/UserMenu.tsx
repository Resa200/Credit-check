import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function UserMenu() {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!profile) return null

  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#F1F5F9] transition-colors"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="h-7 w-7 rounded-full bg-[#EDE9FE] flex items-center justify-center text-xs font-bold text-[#7C3AED]">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-[#1E293B] hidden sm:block max-w-[120px] truncate">
          {profile.full_name || profile.email}
        </span>
        <ChevronDown size={14} className="text-[#94A3B8]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-[#E2E8F0] bg-white shadow-lg py-1 z-50">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
          >
            <User size={15} className="text-[#94A3B8]" />
            Profile
          </Link>
          <hr className="my-1 border-[#E2E8F0]" />
          <button
            type="button"
            onClick={async () => {
              setOpen(false)
              await signOut()
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#F43F5E] hover:bg-[#FFF1F2] transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
