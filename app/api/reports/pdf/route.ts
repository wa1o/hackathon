import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

export const runtime = 'nodejs'

export async function GET() {
  const user = await AuthService.getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const movements = await prisma.movement.findMany({ include: { item: true, center: true, campaign: true }, orderBy: { date: 'desc' }, take: 100 })
  const document = new PDFDocument({ margin: 40 })
  const chunks: Buffer[] = []
  document.on('data', (chunk: Buffer) => chunks.push(chunk))
  const complete = new Promise<Buffer>((resolve) => document.on('end', () => resolve(Buffer.concat(chunks))))
  document.fontSize(18).text('Reporte de movimientos', { align: 'center' }).moveDown()
  document.fontSize(9)
  for (const movement of movements) {
    document.text(`${movement.date.toISOString().slice(0, 10)} | ${movement.type} | ${movement.item.name} | ${movement.quantity} | ${movement.center.name} | ${movement.campaign.name}`)
  }
  document.end()
  const file = await complete
  return new NextResponse(new Uint8Array(file), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="reporte-movimientos.pdf"' } })
}
