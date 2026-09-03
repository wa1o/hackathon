// prisma/seed.ts
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL no está configurada')

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
})

async function main() {
  console.log('🌱 Sembrando datos...')

  // 1. Crear usuarios
  const coordinator = await prisma.user.create({
    data: {
      email: 'coordinador@ejemplo.com',
      passwordHash: await hash('password123', 10),
      name: 'Coordinador General',
      role: 'COORDINADOR'
    }
  })

  const manager = await prisma.user.create({
    data: {
      email: 'encargado@ejemplo.com',
      passwordHash: await hash('password123', 10),
      name: 'Encargado Centro',
      role: 'ENCARGADO'
    }
  })

  const volunteer = await prisma.user.create({
    data: {
      email: 'voluntario@ejemplo.com',
      passwordHash: await hash('password123', 10),
      name: 'Voluntario',
      role: 'VOLUNTARIO'
    }
  })

  const leader = await prisma.user.create({
    data: {
      email: 'lider@ejemplo.com',
      passwordHash: await hash('password123', 10),
      name: 'Líder de Campaña',
      role: 'LIDER_CAMPANA'
    }
  })

  // 2. Crear campaña
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Huracán Otis 2026',
      description: 'Campaña de apoyo para afectados por el huracán Otis',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-30'),
      isActive: true
    }
  })

  // 3. Crear centros con coordenadas
  const center1 = await prisma.collectionCenter.create({
    data: {
      name: 'Centro Comunitario Universidad',
      institution: 'Universidad Nacional',
      location: 'Av. Universidad #1000, CDMX',
      address: 'Av. Universidad #1000, CDMX',
      latitude: 19.3326,
      longitude: -99.1870,
      phone: '55-1234-5678',
      schedule: 'Lunes a Viernes 9:00-18:00',
      contactPerson: 'María López',
      isActive: true,
      managerId: manager.id
    }
  })

  const center2 = await prisma.collectionCenter.create({
    data: {
      name: 'Centro Comunitario Iztapalapa',
      institution: 'Gobierno de la CDMX',
      location: 'Calzada Ermita Iztapalapa #2345',
      address: 'Calzada Ermita Iztapalapa #2345, CDMX',
      latitude: 19.3662,
      longitude: -99.0814,
      phone: '55-8765-4321',
      schedule: 'Lunes a Domingo 8:00-20:00',
      contactPerson: 'Juan Pérez',
      isActive: true
    }
  })

  // 4. Relacionar centros con campaña
  await prisma.campaignCenter.createMany({
    data: [
      { campaignId: campaign.id, centerId: center1.id },
      { campaignId: campaign.id, centerId: center2.id }
    ]
  })

  // 5. Crear artículos
  const items = await prisma.item.createMany({
    data: [
      { name: 'Agua embotellada', category: 'NO_PERECEDERO', unit: 'L', umbralMinimo: 100 },
      { name: 'Arroz', category: 'NO_PERECEDERO', unit: 'KG', umbralMinimo: 50 },
      { name: 'Ropa abrigadora', category: 'ROPA', unit: 'PIEZA', umbralMinimo: 30 },
      { name: 'Jabón en barra', category: 'LIMPIEZA', unit: 'PIEZA', umbralMinimo: 40 },
      { name: 'Paracetamol', category: 'MEDICAMENTO', unit: 'PIEZA', umbralMinimo: 20 }
    ]
  })

  // 6. Obtener los artículos creados
  const allItems = await prisma.item.findMany()

  // 7. Crear movimientos iniciales
  for (const item of allItems) {
    await prisma.movement.create({
      data: {
        type: 'RECEPCION',
        quantity: 100,
        actorId: coordinator.id,
        campaignId: campaign.id,
        centerId: center1.id,
        itemId: item.id,
        donorName: 'Donante Anónimo'
      }
    })

    await prisma.movement.create({
      data: {
        type: 'RECEPCION',
        quantity: 50,
        actorId: coordinator.id,
        campaignId: campaign.id,
        centerId: center2.id,
        itemId: item.id,
        donorName: 'Cruz Roja'
      }
    })
  }

  // 8. Crear una meta de recolección
  await prisma.campaignGoal.create({
    data: {
      campaignId: campaign.id,
      itemId: allItems[0].id,
      targetQuantity: 500,
      currentQuantity: 150
    }
  })

  console.log('✅ Datos sembrados correctamente')
  console.log(`
    📋 Credenciales:
    Coordinador: coordinador@ejemplo.com / password123
    Encargado: encargado@ejemplo.com / password123
    Voluntario: voluntario@ejemplo.com / password123
    Líder: lider@ejemplo.com / password123
  `)
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })