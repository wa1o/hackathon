import { ResourceForm } from '@/components/ResourceForm'

export default function NewCampaignPage() {
  return <ResourceForm resource="/dashboard/coordinator" endpoint="/api/campaigns" title="Crear campaña" fields={[{ name: 'name', label: 'Nombre' }, { name: 'description', label: 'Descripción' }, { name: 'startDate', label: 'Fecha de inicio', type: 'date' }, { name: 'endDate', label: 'Fecha de fin', type: 'date' }]} />
}
