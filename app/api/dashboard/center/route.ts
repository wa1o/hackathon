// src/app/api/dashboard/center/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const centerId = searchParams.get('centerId')

    if (!centerId) {
      return NextResponse.json(
        { error: 'CenterId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario tenga acceso al centro
    const center = await prisma.collectionCenter.findFirst({
      where: {
        id: centerId,
        OR: [
          { managerId: user.id },
          { users: { some: { id: user.id } } }
        ]
      }
    })

    if (!center && user.role !== 'COORDINADOR') {
      return NextResponse.json(
        { error: 'No tienes acceso a este centro' },
        { status: 403 }
      )
    }

    // 1. Obtener stock por artículo
    const items = await prisma.item.findMany({
      include: {
        movements: {
          where: { centerId }
        }
      }
    })

    const stockByItem = items.map(item => {
      const stock = item.movements.reduce((total, movement) => {
        if (movement.type === 'RECEPCION' || movement.type === 'TRANSFERENCIA_ENTRADA') {
          return total + movement.quantity
        } else if (movement.type === 'ENTREGA' || movement.type === 'MERMA' || movement.type === 'TRANSFERENCIA_SALIDA') {
          return total - movement.quantity
        } else if (movement.type === 'AJUSTE') {
          return total + movement.quantity
        }
        return total
      }, 0)

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        stock,
        umbralMinimo: item.umbralMinimo,
        isLow: item.umbralMinimo !== null && stock < item.umbralMinimo
      }
    })

    // 2. Movimientos recientes
    const recentMovements = await prisma.movement.findMany({
      where: { centerId },
      include: {
        item: true,
        actor: {
          select: { name: true, email: true }
        }
      },
      take: 20,
      orderBy: { date: 'desc' }
    })

    // 3. Totales
    const totals = {
      recepciones: await prisma.movement.count({
        where: { centerId, type: 'RECEPCION' }
      }),
      entregas: await prisma.movement.count({
        where: { centerId, type: 'ENTREGA' }
      }),
      mermas: await prisma.movement.count({
        where: { centerId, type: 'MERMA' }
      }),
      transferencias: await prisma.movement.count({
        where: { centerId, type: { in: ['TRANSFERENCIA_ENTRADA', 'TRANSFERENCIA_SALIDA'] } }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        center,
        stockByItem,
        recentMovements,
        totals,
        itemsAtRisk: stockByItem.filter(item => item.isLow)
      }
    })

  } catch (error: any) {
    console.error('Error fetching center dashboard:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener dashboard del centro' },
      { status: 500 }
    )
  }
}