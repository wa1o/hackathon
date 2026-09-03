import { ResourceForm } from '@/components/ResourceForm'

export default function NewCenterPage() {
  return <ResourceForm resource="/dashboard/coordinator" endpoint="/api/centers" title="Registrar centro" fields={[{ name: 'name', label: 'Nombre' }, { name: 'institution', label: 'Institución' }, { name: 'location', label: 'Ubicación' }, { name: 'address', label: 'Dirección' }, { name: 'phone', label: 'Teléfono' }, { name: 'schedule', label: 'Horario' }, { name: 'contactPerson', label: 'Persona de contacto' }]} />
}
