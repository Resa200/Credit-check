import { useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import Button from '@/components/atoms/Button'

interface PaystackButtonProps {
  onSuccess?: () => void
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function PaystackButton({
  onSuccess,
  children,
  size = 'md',
  className,
}: PaystackButtonProps) {
  const { initializePaystack } = useSubscription()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await initializePaystack(onSuccess)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size={size} className={className} onClick={handleClick} loading={loading}>
      {children ?? 'Subscribe Now'}
    </Button>
  )
}
