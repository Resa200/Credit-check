import { cn } from '@/lib/utils'
import Label from '@/components/atoms/Label'
import Input from '@/components/atoms/Input'
import Tooltip from '@/components/atoms/Tooltip'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  // fieldId is used for label ↔ input linking; separate from the input's name attr
  fieldId: string
  tooltip?: string
  error?: string
  required?: boolean
  inputClassName?: string
}

export default function FormField({
  label,
  fieldId,
  tooltip,
  error,
  required,
  inputClassName,
  className,
  ...inputProps
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-1">
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <Input
        id={fieldId}
        error={!!error}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={inputClassName}
        {...inputProps}
      />
      {error && (
        <p id={`${fieldId}-error`} className="text-xs text-[#F43F5E] mt-0.5">
          {error}
        </p>
      )}
    </div>
  )
}
