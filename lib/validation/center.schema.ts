import { z } from 'zod'

export const centerCreateSchema = z.object({
  name: z.string().trim().min(1),
  institution: z.string().trim().min(1),
  location: z.string().trim().min(1),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  schedule: z.string().trim().optional(),
  contactPerson: z.string().trim().optional(),
  managerId: z.string().uuid().optional()
})

export const centerUpdateSchema = centerCreateSchema.partial().extend({
  isActive: z.boolean().optional()
})
