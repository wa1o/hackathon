// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL no está configurada')
}

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
  pgPool: Pool | undefined
}

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
    max: 5, // el pooler de Supabase en modo transaction ya multiplexa; no necesitas muchas conexiones por instancia
    idleTimeoutMillis: 10_000,
    allowExitOnIdle: false,
  })

// Evita que un error en un cliente idle tumbe el proceso en dev
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de pg:', err)
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.pgPool = pool

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma