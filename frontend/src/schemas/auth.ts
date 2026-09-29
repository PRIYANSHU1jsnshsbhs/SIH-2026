import { z } from 'zod'

export const roleSchema = z.enum(['INVESTIGATOR', 'ADMIN', 'DEVOPS', 'investigator', 'admin', 'devops']).transform(val => val.toLowerCase() as 'investigator' | 'admin' | 'devops')
export type Role = 'investigator' | 'admin' | 'devops'

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().optional(),
  role: roleSchema,
})
export type User = z.infer<typeof userSchema>

export const loginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number(),
  user: userSchema,
}).transform(val => ({
  accessToken: val.access_token,
  tokenType: val.token_type,
  expiresIn: val.expires_in,
  user: val.user,
}))
export type LoginResponse = z.infer<typeof loginResponseSchema>

export const loginInputSchema = z.object({
  username: z.string(),
  password: z.string(),
})
export type LoginInput = z.infer<typeof loginInputSchema>
