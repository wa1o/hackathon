'use server'

import { redirect } from 'next/navigation'
import { AuthService } from '@/services/auth.service'
import QrRegisterForm from './QrRegisterForm'

export default async function RegisterQrPage() {
  const user = await AuthService.getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'LIDER_CAMPANA') redirect('/dashboard/volunteer')
  return <QrRegisterForm />
}
