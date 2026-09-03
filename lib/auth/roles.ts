// lib/auth/roles.ts
import { Role } from '@prisma/client'

export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole)
}

export function canManageMovements(userRole: Role): boolean {
  return ['COORDINADOR', 'ENCARGADO', 'VOLUNTARIO'].includes(userRole)
}

export function canProposeMerma(userRole: Role): boolean {
  return ['COORDINADOR', 'ENCARGADO'].includes(userRole)
}

export function canApproveMerma(userRole: Role): boolean {
  return userRole === 'COORDINADOR'
}

export function canAccessCenter(user: { id: string; role: Role }, centerId: string): boolean {
  if (user.role === 'COORDINADOR') return true
  // En el futuro, verificar que el usuario está asignado al centro
  return true
}