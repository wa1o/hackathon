import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2),
  role: z.enum(['COORDINADOR', 'ENCARGADO', 'VOLUNTARIO', 'INSTITUCION', 'LIDER_CAMPANA']).optional()
})
