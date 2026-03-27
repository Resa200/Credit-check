import { z } from 'zod'

export const bvnSchema = z.object({
  bvn: z
    .string()
    .length(11, 'BVN must be exactly 11 digits')
    .regex(/^\d+$/, 'BVN must contain only numbers'),
  contact: z
    .string()
    .min(1, 'Contact is required')
    .refine(
      (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
        /^(0)[789]\d{9}$/.test(v),
      'Enter a valid email address or Nigerian phone number (e.g. 08012345678)'
    ),
})

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

export const accountSchema = z.object({
  account_number: z
    .string()
    .length(10, 'Account number must be exactly 10 digits')
    .regex(/^\d+$/, 'Account number must contain only numbers'),
  bank_code: z.string().min(1, 'Please select a bank'),
})

export const creditReportSchema = z.object({
  bvn: z
    .string()
    .length(11, 'BVN must be exactly 11 digits')
    .regex(/^\d+$/, 'BVN must contain only numbers'),
  bureau: z.enum(['crc', 'firstcentral', 'combined'], {
    error: 'Please select a bureau',
  }),
})

export type BVNFormValues = z.infer<typeof bvnSchema>
export type OTPFormValues = z.infer<typeof otpSchema>
export type AccountFormValues = z.infer<typeof accountSchema>
export type CreditReportFormValues = z.infer<typeof creditReportSchema>

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export const signupSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^(0|\+234)[789]\d{9}$/.test(v),
      'Enter a valid Nigerian phone number'
    ),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
