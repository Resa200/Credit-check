export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string
export const PAYSTACK_PLAN_CODE = import.meta.env.VITE_PAYSTACK_PLAN_CODE as string || 'PLN_xxxxx'
export const FREE_MONTHLY_LIMIT = 5

let scriptPromise: Promise<void> | null = null

export function loadPaystackScript(): Promise<void> {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).PaystackPop) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v2/inline.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Failed to load Paystack script'))
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}

export function getFirstOfMonth(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}
