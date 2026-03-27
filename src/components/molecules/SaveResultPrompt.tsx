import { Link } from 'react-router-dom'
import { Save } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import type { ServiceType } from '@/types/adjutor.types'
import Button from '@/components/atoms/Button'

interface SaveResultPromptProps {
  serviceType: Exclude<ServiceType, null>
  requestPayload: Record<string, unknown>
  responsePayload: Record<string, unknown>
}

export default function SaveResultPrompt({
  serviceType,
  requestPayload,
  responsePayload,
}: SaveResultPromptProps) {
  const { isAuthenticated } = useAuth()
  const setPendingResult = useAuthStore((s) => s.setPendingResult)

  if (isAuthenticated) return null

  function handleSaveClick() {
    setPendingResult({ serviceType, requestPayload, responsePayload })
  }

  return (
    <div className="rounded-xl border border-[#7C3AED]/20 bg-[#EDE9FE]/30 p-4 flex flex-col sm:flex-row items-center gap-3">
      <div className="flex items-center gap-2 flex-1">
        <Save size={18} className="text-[#7C3AED] shrink-0" />
        <p className="text-sm text-[#1E293B]">
          <span className="font-medium">Save this result?</span>{' '}
          <span className="text-[#64748B]">Sign in to keep a history of your lookups.</span>
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link to="/login" onClick={handleSaveClick}>
          <Button size="sm">Sign In</Button>
        </Link>
        <Link to="/signup" onClick={handleSaveClick}>
          <Button size="sm" variant="outline">Sign Up</Button>
        </Link>
      </div>
    </div>
  )
}
