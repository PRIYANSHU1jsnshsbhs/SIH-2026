import { z } from 'zod'

export const roleSchema = z.enum(['investigator', 'admin', 'devops'])
export type Role = z.infer<typeof roleSchema>

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  role: roleSchema,
})
export type User = z.infer<typeof userSchema>

export const loginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('bearer'),
  expires_in: z.number(),
  user: userSchema,
})
export type LoginResponse = z.infer<typeof loginResponseSchema>

export const loginInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})
export type LoginInput = z.infer<typeof loginInputSchema>
