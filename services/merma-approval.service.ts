// services/merma-approval.service.ts
import { prisma } from '@/lib/prisma'
import { MovementService } from './movement.service'
import { MermaStatus } from '@prisma/client'

export class MermaApprovalService {
  // Proponer merma
  static async proposeMerma(data: {
    centerId: string
    itemId: string
    quantity: number
    reason: string
    requestedById: string
    evidence?: string
  }) {
    if (data.quantity <= 0) {
      throw new Error('La cantidad debe ser positiva')
    }

    if (!data.reason) {
      throw new Error('El motivo es obligatorio')
    }

    // Crear solicitud de merma
    return await prisma.mermaRequest.create({
      data: {
        centerId: data.centerId,
        itemId: data.itemId,
        quantity: data.quantity,
        reason: data.reason,
        requestedById: data.requestedById,
        evidence: data.evidence,
        status: 'PENDIENTE'
      },
      include: {
        center: true,
        item: true,
        requestedBy: {
          select: { name: true, email: true }
        }
      }
    })
  }

  // Aprobar merma
  static async approveMerma(
    requestId: string,
    approvedById: string,
    campaignId: string
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Obtener solicitud
      const request = await tx.mermaRequest.findUnique({
        where: { id: requestId },
        include: { center: true }
      })

      if (!request) {
        throw new Error('Solicitud no encontrada')
      }

      if (request.status !== 'PENDIENTE') {
        throw new Error(`La solicitud ya fue ${request.status.toLowerCase()}`)
      }

      // 2. Verificar stock
      const currentStock = await MovementService.calculateStockInTx(
        tx,
        request.centerId,
        campaignId,
        request.itemId
      )

      if (currentStock < request.quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${currentStock}`)
      }

      // 3. Crear movimiento de merma
      const movement = await tx.movement.create({
        data: {
          type: 'MERMA',
          quantity: request.quantity,
          actorId: approvedById,
          campaignId: campaignId,
          centerId: request.centerId,
          itemId: request.itemId,
          reason: request.reason
        }
      })

      // 4. Actualizar solicitud
      const updatedRequest = await tx.mermaRequest.update({
        where: { id: requestId },
        data: {
          status: 'APROBADA',
          approvedById: approvedById,
          movementId: movement.id
        }
      })

      return { request: updatedRequest, movement }
    }, {
      isolationLevel: 'Serializable'
    })
  }

  // Rechazar merma
  static async rejectMerma(requestId: string, approvedById: string) {
    return await prisma.mermaRequest.update({
      where: { id: requestId },
      data: {
        status: 'RECHAZADA',
        approvedById: approvedById
      }
    })
  }

  // Obtener solicitudes pendientes
  static async getPendingRequests() {
    return await prisma.mermaRequest.findMany({
      where: { status: 'PENDIENTE' },
      include: {
        center: true,
        item: true,
        requestedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}