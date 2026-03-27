import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { User, History, FileText, CreditCard, Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AppShell from '@/components/templates/AppShell'
import ProfileForm from '@/components/organisms/ProfileForm'
import LookupHistoryTable from '@/components/organisms/LookupHistoryTable'
import AuditLogTable from '@/components/organisms/AuditLogTable'
import SubscriptionPanel from '@/components/organisms/SubscriptionPanel'
import Button from '@/components/atoms/Button'
import { cn } from '@/lib/utils'

type Tab = 'profile' | 'history' | 'audit' | 'subscription'

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: 'Profile', icon: <User size={16} /> },
  { key: 'subscription', label: 'Subscription', icon: <CreditCard size={16} /> },
  { key: 'history', label: 'Lookup History', icon: <History size={16} /> },
  { key: 'audit', label: 'Audit Log', icon: <FileText size={16} /> },
]

export default function Profile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { deleteAccount, profile } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Support ?tab=subscription URL param (from QuotaBanner link)
  useEffect(() => {
    const tab = searchParams.get('tab') as Tab | null
    if (tab && tabs.some((t) => t.key === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await deleteAccount()
      toast.success('Account deleted successfully')
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account'
      toast.error(message)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover border-2 border-[#E2E8F0]"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#EDE9FE] flex items-center justify-center border-2 border-[#E2E8F0]">
              <span className="text-xl font-bold text-[#7C3AED]">
                {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-[#1E293B]">
              {profile?.full_name || 'Your Profile'}
            </h1>
            <p className="text-sm text-[#94A3B8]">{profile?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#E2E8F0] mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px]',
                activeTab === tab.key
                  ? 'border-[#7C3AED] text-[#7C3AED]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#1E293B]'
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-8">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h2 className="text-sm font-semibold text-[#1E293B] mb-4">
                Personal Information
              </h2>
              <ProfileForm />
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-[#F43F5E]/30 bg-[#FFF1F2]/30 p-6">
              <h2 className="text-sm font-semibold text-[#F43F5E] mb-2 flex items-center gap-2">
                <AlertTriangle size={16} />
                Danger Zone
              </h2>
              <p className="text-sm text-[#64748B] mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>

              {showDeleteConfirm ? (
                <div className="flex flex-col gap-3 bg-white rounded-xl border border-[#F43F5E]/30 p-4">
                  <p className="text-sm font-medium text-[#1E293B]">
                    Are you sure you want to delete your account?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deleting}
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 size={14} />
                      Yes, Delete My Account
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={14} />
                  Delete Account
                </Button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && <LookupHistoryTable />}
        {activeTab === 'subscription' && <SubscriptionPanel />}
        {activeTab === 'audit' && <AuditLogTable />}
      </div>
    </AppShell>
  )
}
