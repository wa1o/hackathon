import { z } from 'zod'

export const campaignCreateSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  centerIds: z.array(z.string().uuid()).optional()
}).refine((data) => data.startDate <= data.endDate, {
  message: 'La fecha de inicio debe ser anterior a la fecha fin',
  path: ['endDate']
})

export const campaignUpdateSchema = campaignCreateSchema.partial().extend({
  isActive: z.boolean().optional()
})
