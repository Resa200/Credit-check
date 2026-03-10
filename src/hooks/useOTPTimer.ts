import { useState, useEffect, useCallback } from 'react'

export function useOTPTimer(seconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(seconds)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  const restart = useCallback(() => {
    setSecondsLeft(seconds)
  }, [seconds])

  return { secondsLeft, restart }
}
