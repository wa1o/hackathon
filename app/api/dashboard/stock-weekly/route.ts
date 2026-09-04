import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

function movementDelta(type: string, quantity: number) {
  if (type === 'RECEPCION' || type === 'TRANSFERENCIA_ENTRADA' || type === 'AJUSTE') return quantity
  return -quantity
}

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const requestedCenterId = request.nextUrl.searchParams.get('centerId')
    if (requestedCenterId && user.role !== 'COORDINADOR') {
      const ownsCenter = user.managedCenter?.id === requestedCenterId || user.centers?.some((center) => center.id === requestedCenterId)
      if (!ownsCenter) return NextResponse.json({ error: 'No tienes acceso a este centro' }, { status: 403 })
    }

    const today = new Date()
    today.setUTCHours(23, 59, 59, 999)
    const start = new Date(today)
    start.setUTCDate(start.getUTCDate() - 6)
    start.setUTCHours(0, 0, 0, 0)

    const movements = await prisma.movement.findMany({
      where: { ...(requestedCenterId ? { centerId: requestedCenterId } : {}), date: { lte: today } },
      select: { itemId: true, type: true, quantity: true, date: true, item: { select: { name: true, unit: true } } },
      orderBy: { date: 'asc' }
    })

    const itemTotals = new Map<string, number>()
    for (const movement of movements) itemTotals.set(movement.itemId, (itemTotals.get(movement.itemId) || 0) + movementDelta(movement.type, movement.quantity))
    const selectedIds = new Set([...itemTotals.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 5).map(([id]) => id))
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setUTCDate(start.getUTCDate() + index)
      return date
    })
    const series = [...selectedIds].map((itemId) => {
      const itemMovement = movements.filter((movement) => movement.itemId === itemId)
      const data = dates.map((date) => itemMovement.reduce((total, movement) => movement.date <= new Date(date.getTime() + 86_399_999) ? total + movementDelta(movement.type, movement.quantity) : total, 0))
      const item = itemMovement[0]?.item
      return { id: itemId, name: item?.name || 'Artículo', unit: item?.unit || '', data }
    })

    return NextResponse.json({ success: true, data: { dates: dates.map((date) => date.toISOString().slice(0, 10)), series } })
  } catch (error: any) {
    console.error('Error fetching weekly stock:', error)
    return NextResponse.json({ error: error.message || 'Error al obtener stock semanal' }, { status: 500 })
  }
}
