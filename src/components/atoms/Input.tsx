import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[#1E293B] placeholder:text-[#94A3B8]',
          'transition-all duration-150 outline-none',
          'focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20',
          error
            ? 'border-[#F43F5E] focus:border-[#F43F5E] focus:ring-[#F43F5E]/20'
            : 'border-[#E2E8F0]',
          'disabled:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-60',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
export default Input
