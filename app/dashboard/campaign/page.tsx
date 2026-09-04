import { redirect } from 'next/navigation'
import { AuthService } from '@/services/auth.service'
import { DashboardView } from '@/components/DashboardView'

export default async function CampaignPage() {
  const user = await AuthService.getCurrentUser()
  if (!user) redirect('/login')
  if (user.role === 'LIDER_CAMPANA' && !user.campaignsLed?.length) redirect('/campaign/register-qr')
  return <DashboardView role="campaign" />
}
