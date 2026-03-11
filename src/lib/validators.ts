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
  bureau: z.enum(['crc', 'firstcentral'], {
    error: 'Please select a bureau',
  }),
})

export type BVNFormValues = z.infer<typeof bvnSchema>
export type OTPFormValues = z.infer<typeof otpSchema>
export type AccountFormValues = z.infer<typeof accountSchema>
export type CreditReportFormValues = z.infer<typeof creditReportSchema>
