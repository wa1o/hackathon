import { z } from 'zod'

const baseMovement = {
  centerId: z.string().uuid(),
  campaignId: z.string().uuid(),
  itemId: z.string().uuid(),
  quantity: z.coerce.number().positive()
}

export const receptionSchema = z.object({ ...baseMovement, donorName: z.string().trim().optional() })
export const deliverySchema = z.object({ ...baseMovement, institutionId: z.string().uuid().optional() })
export const transferSchema = z.object({
  originCenterId: z.string().uuid(),
  targetCenterId: z.string().uuid(),
  campaignId: z.string().uuid(),
  itemId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  reason: z.string().trim().optional()
})
