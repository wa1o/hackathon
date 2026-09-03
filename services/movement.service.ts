// services/movement.service.ts
import { prisma } from '@/lib/prisma'
import { MovementType, Prisma } from '@prisma/client'

export class MovementService {
  static async registerReception(data: {
    centerId: string
    campaignId: string
    itemId: string
    quantity: number
    actorId: string
    donorName?: string
  }) {
    if (data.quantity <= 0) {
      throw new Error('La cantidad debe ser positiva')
    }

    return prisma.movement.create({
      data: {
        type: 'RECEPCION',
        quantity: data.quantity,
        donorName: data.donorName,
        actorId: data.actorId,
        campaignId: data.campaignId,
        centerId: data.centerId,
        itemId: data.itemId
      },
      include: {
        item: true,
        center: true,
        actor: { select: { name: true, email: true } }
      }
    })
  }

  // Calcular stock (la regla más importante)
  static async calculateStock(
    centerId: string,
    campaignId: string,
    itemId: string
  ): Promise<number> {
    const movements = await prisma.movement.findMany({
      where: {
        centerId,
        campaignId,
        itemId
      }
    })

    return movements.reduce((total, movement) => {
      switch (movement.type) {
        case 'RECEPCION':
        case 'TRANSFERENCIA_ENTRADA':
          return total + movement.quantity
        case 'ENTREGA':
        case 'MERMA':
        case 'TRANSFERENCIA_SALIDA':
          return total - movement.quantity
        case 'AJUSTE':
          return total + movement.quantity
        default:
          return total
      }
    }, 0)
  }

  // 🔒 Método para calcular stock DENTRO de una transacción
  static async calculateStockInTx(
    tx: Prisma.TransactionClient,
    centerId: string,
    campaignId: string,
    itemId: string
  ): Promise<number> {
    const movements = await tx.movement.findMany({
      where: {
        centerId,
        campaignId,
        itemId
      }
    })

    return movements.reduce((total, movement) => {
      switch (movement.type) {
        case 'RECEPCION':
        case 'TRANSFERENCIA_ENTRADA':
          return total + movement.quantity
        case 'ENTREGA':
        case 'MERMA':
        case 'TRANSFERENCIA_SALIDA':
          return total - movement.quantity
        case 'AJUSTE':
          return total + movement.quantity
        default:
          return total
      }
    }, 0)
  }

  // Registrar entrega con validación atómica
  static async registerDelivery(data: {
    centerId: string
    campaignId: string
    itemId: string
    quantity: number
    actorId: string
    institutionId?: string
  }) {
    if (data.quantity <= 0) {
      throw new Error('La cantidad debe ser positiva')
    }

    // 🔒 Transacción serializable para evitar race conditions
    return await prisma.$transaction(async (tx) => {
      // 1. Calcular stock actual DENTRO de la transacción
      const currentStock = await this.calculateStockInTx(
        tx,
        data.centerId,
        data.campaignId,
        data.itemId
      )

      // 2. Validar stock negativo
      if (currentStock < data.quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${currentStock}`)
      }

      // 3. Crear movimiento
      const movement = await tx.movement.create({
        data: {
          type: 'ENTREGA',
          quantity: data.quantity,
          actorId: data.actorId,
          campaignId: data.campaignId,
          centerId: data.centerId,
          itemId: data.itemId
        },
        include: {
          item: true,
          center: true,
          actor: {
            select: { name: true, email: true }
          }
        }
      })

      // 4. Si hay institución, crear delivery
      if (data.institutionId) {
        await tx.delivery.create({
          data: {
            originCenterId: data.centerId,
            institutionId: data.institutionId,
            movementId: movement.id,
            status: 'PENDING'
          }
        })
      }

      // 5. Verificar alerta de stock bajo (después de la transacción)
      // Se hará en un paso separado

      return movement
    }, {
      isolationLevel: 'Serializable'  // 🔒 Máxima consistencia
    })
  }

  // Registrar transferencia (atómica)
  static async registerTransfer(data: {
    originCenterId: string
    targetCenterId: string
    campaignId: string
    itemId: string
    quantity: number
    actorId: string
  }) {
    if (data.quantity <= 0) {
      throw new Error('La cantidad debe ser positiva')
    }

    if (data.originCenterId === data.targetCenterId) {
      throw new Error('Los centros deben ser distintos')
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Verificar stock en origen
      const currentStock = await this.calculateStockInTx(
        tx,
        data.originCenterId,
        data.campaignId,
        data.itemId
      )

      if (currentStock < data.quantity) {
        throw new Error(`Stock insuficiente en origen. Disponible: ${currentStock}`)
      }

      // 2. Salida del origen
      const originMovement = await tx.movement.create({
        data: {
          type: 'TRANSFERENCIA_SALIDA',
          quantity: data.quantity,
          actorId: data.actorId,
          campaignId: data.campaignId,
          centerId: data.originCenterId,
          itemId: data.itemId,
          targetCenterId: data.targetCenterId
        }
      })

      // 3. Entrada al destino
      const targetMovement = await tx.movement.create({
        data: {
          type: 'TRANSFERENCIA_ENTRADA',
          quantity: data.quantity,
          actorId: data.actorId,
          campaignId: data.campaignId,
          centerId: data.targetCenterId,
          itemId: data.itemId
        }
      })

      return { originMovement, targetMovement }
    }, {
      isolationLevel: 'Serializable'
    })
  }

  // Registrar ajuste manual
  static async registerAdjustment(data: {
    centerId: string
    campaignId: string
    itemId: string
    quantity: number
    actorId: string
    reason: string
  }) {
    if (!data.reason) {
      throw new Error('El motivo del ajuste es obligatorio')
    }

    return await prisma.movement.create({
      data: {
        type: 'AJUSTE',
        quantity: data.quantity,
        actorId: data.actorId,
        campaignId: data.campaignId,
        centerId: data.centerId,
        itemId: data.itemId,
        reason: data.reason
      },
      include: {
        item: true,
        center: true,
        actor: {
          select: { name: true, email: true }
        }
      }
    })
  }
}