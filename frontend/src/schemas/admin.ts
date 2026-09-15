import { z } from 'zod'
import { roleSchema } from './auth'

export const managedUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  role: roleSchema,
  active: z.boolean(),
  last_login: z.string().nullable(),
})
export type ManagedUser = z.infer<typeof managedUserSchema>

export const systemStatusSchema = z.object({
  database: z.enum(['healthy', 'degraded', 'down']),
  blockchain_indexer: z.enum(['healthy', 'degraded', 'down']),
  queue: z.enum(['healthy', 'degraded', 'down']),
  ml_service: z.enum(['healthy', 'degraded', 'down']),
})
export type SystemStatus = z.infer<typeof systemStatusSchema>

export const auditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  actor: z.string(),
  action: z.string(),
  target: z.string().optional(),
})
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>
