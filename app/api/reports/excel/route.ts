import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

export const runtime = 'nodejs'

export async function GET() {
  const user = await AuthService.getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const movements = await prisma.movement.findMany({ include: { item: true, center: true, campaign: true, actor: { select: { name: true } } }, orderBy: { date: 'desc' } })
  const rows = movements.map((movement) => ({ Fecha: movement.date.toISOString(), Tipo: movement.type, Articulo: movement.item.name, Cantidad: movement.quantity, Centro: movement.center.name, Campana: movement.campaign.name, Responsable: movement.actor.name }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Movimientos')
  const file = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return new NextResponse(file, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="reporte-movimientos.xlsx"' } })
}
