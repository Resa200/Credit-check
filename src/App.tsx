import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppShell from '@/components/templates/AppShell'
import Landing from '@/pages/Landing'
import Services from '@/pages/Services'
import Verify from '@/pages/Verify'

function LandingWithShell() {
  return (
    <AppShell>
      <Landing />
    </AppShell>
  )
}

export default function App() {
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
      <Routes>
        <Route path="/" element={<LandingWithShell />} />
        <Route path="/services" element={<Services />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
