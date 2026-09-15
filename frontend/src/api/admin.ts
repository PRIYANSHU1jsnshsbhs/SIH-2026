import { delay, getSystemStatus, listAuditLog, listManagedUsers, setUserActive, updateUserRole } from '@/mocks/mockStore'
import { parseEnvelope, ApiRequestError } from './envelope'
import { auditLogEntrySchema, managedUserSchema, systemStatusSchema } from '@/schemas/admin'
import type { Role } from '@/schemas/auth'
import { z } from 'zod'

export async function fetchSystemStatus() {
  await delay(150)
  return parseEnvelope(systemStatusSchema, { success: true, data: getSystemStatus() })
}

export async function fetchManagedUsers() {
  await delay()
  const users = listManagedUsers()
  return parseEnvelope(z.array(managedUserSchema), { success: true, data: users })
}

export async function fetchAuditLog() {
  await delay()
  const entries = listAuditLog()
  return parseEnvelope(z.array(auditLogEntrySchema), { success: true, data: entries })
}

export async function setUserActiveRequest(userId: string, active: boolean) {
  await delay()
  try {
    return parseEnvelope(managedUserSchema, { success: true, data: setUserActive(userId, active) })
  } catch {
    throw new ApiRequestError('USER_NOT_FOUND', `User ${userId} was not found`)
  }
}

export async function updateUserRoleRequest(userId: string, role: Role) {
  await delay()
  try {
    return parseEnvelope(managedUserSchema, { success: true, data: updateUserRole(userId, role) })
  } catch {
    throw new ApiRequestError('USER_NOT_FOUND', `User ${userId} was not found`)
  }
}
