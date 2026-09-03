// src/app/api/dashboard/coordinator/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user || user.role !== 'COORDINADOR') {
      return NextResponse.json(
        { error: 'Solo el coordinador puede ver este dashboard' },
        { status: 403 }
      )
    }

    // 1. Totales generales
    const [totalCenters, totalCampaigns, totalMovements, totalItems] = await Promise.all([
      prisma.collectionCenter.count(),
      prisma.campaign.count({ where: { isActive: true } }),
      prisma.movement.count(),
      prisma.item.count()
    ])

    // 2. Movimientos por tipo
    const movementsByType = await prisma.movement.groupBy({
      by: ['type'],
      _count: true,
      _sum: {
        quantity: true
      }
    })

    // 3. Top artículos donados
    const topItems = await prisma.movement.groupBy({
      by: ['itemId'],
      where: { type: 'RECEPCION' },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    })

    const topItemsWithNames = await Promise.all(
      topItems.map(async (item) => {
        const itemData = await prisma.item.findUnique({
          where: { id: item.itemId },
          select: { name: true, category: true, unit: true }
        })
        return {
          ...itemData,
          totalQuantity: item._sum.quantity
        }
      })
    )

    // 4. Merma por motivo
    const mermaByReason = await prisma.movement.groupBy({
      by: ['reason'],
      where: { type: 'MERMA' },
      _sum: { quantity: true }
    })

    // 5. Centros con más actividad
    const centersActivity = await prisma.movement.groupBy({
      by: ['centerId'],
      _count: true,
      _sum: { quantity: true }
    })

    const centersWithNames = await Promise.all(
      centersActivity.map(async (center) => {
        const centerData = await prisma.collectionCenter.findUnique({
          where: { id: center.centerId },
          select: { name: true, institution: true }
        })
        return {
          ...centerData,
          movementCount: center._count,
          totalQuantity: center._sum.quantity
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          centers: totalCenters,
          campaigns: totalCampaigns,
          movements: totalMovements,
          items: totalItems
        },
        movementsByType,
        topItems: topItemsWithNames,
        mermaByReason,
        centersActivity: centersWithNames
      }
    })

  } catch (error: any) {
    console.error('Error fetching coordinator dashboard:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener dashboard' },
      { status: 500 }
    )
  }
}