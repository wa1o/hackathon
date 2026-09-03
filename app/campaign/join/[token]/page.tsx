import { redirect } from 'next/navigation'
import { AuthService } from '@/services/auth.service'
import { QRService } from '@/services/qr.service'

export default async function JoinCampaignPage({ params }: { params: Promise<{ token: string }> }) {
  const user = await AuthService.getCurrentUser()
  const token = (await params).token

  if (!user) redirect(`/login?next=/campaign/join/${encodeURIComponent(token)}`)

  try {
    await QRService.joinCampaign(token, user.id)
    redirect('/dashboard/campaign')
  } catch (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <section className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">No fue posible unirse</h1>
          <p className="mt-3 text-slate-600">{error instanceof Error ? error.message : 'El QR no es válido.'}</p>
        </section>
      </main>
    )
  }
}
