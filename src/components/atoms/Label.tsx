import { cn } from '@/lib/utils'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export default function Label({ required, className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('block text-sm font-medium text-[#1E293B] mb-1', className)}
      {...props}
    >
      {children}
      {required && <span className="text-[#F43F5E] ml-0.5">*</span>}
    </label>
  )
}
