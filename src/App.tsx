import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppShell from '@/components/templates/AppShell'
import AuthGuard from '@/components/molecules/AuthGuard'
import { useAuthInit } from '@/hooks/useAuth'
import Landing from '@/pages/Landing'
import Services from '@/pages/Services'
import Verify from '@/pages/Verify'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Profile from '@/pages/Profile'
import AuthCallback from '@/pages/AuthCallback'
import ShareView from '@/pages/ShareView'
import CommandBar from '@/components/organisms/CommandBar'

function LandingWithShell() {
  return (
    <AppShell>
      <Landing />
    </AppShell>
  )
}

export default function App() {
  useAuthInit()

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            fontSize: '14px',
          },
        }}
      />
      <CommandBar />
      <Routes>
        <Route path="/" element={<LandingWithShell />} />
        <Route path="/services" element={<Services />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          }
        />
        <Route path="/share" element={<ShareView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
