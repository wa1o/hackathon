import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

export async function GET() {
  const user = await AuthService.getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const movements = await prisma.movement.findMany({ include: { item: true, center: true, campaign: true }, orderBy: { date: 'desc' } })
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
  const rows = [
    ['Fecha', 'Tipo', 'Articulo', 'Cantidad', 'Centro', 'Campana'],
    ...movements.map((movement) => [movement.date.toISOString(), movement.type, movement.item.name, movement.quantity, movement.center.name, movement.campaign.name])
  ]
  const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n')
  return new NextResponse(`\uFEFF${csv}`, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="reporte-movimientos.csv"' } })
}
