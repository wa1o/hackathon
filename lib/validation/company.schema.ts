import { z } from 'zod'

export const companyRequestSchema = z.object({
  companyName: z.string().trim().min(2),
  contactName: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().trim().min(7).max(30).optional(),
  message: z.string().trim().max(1000).optional(),
  password: z.string().min(8)
})

export const companyDecisionSchema = z.object({
  decision: z.enum(['approve', 'reject'])
})
