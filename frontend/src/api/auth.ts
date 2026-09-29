import { parseEnvelope } from './envelope'
import { apiClient } from './client'
import { loginResponseSchema, userSchema, type LoginInput, type LoginResponse, type User } from '@/schemas/auth'

export async function login(input: LoginInput): Promise<LoginResponse> {
  const data = await apiClient<any>('/auth/login', {
    method: 'POST',
    body: input,
  })
  
  return parseEnvelope(loginResponseSchema, data)
}

export async function getMe(): Promise<User> {
  const data = await apiClient<any>('/auth/me')
  return parseEnvelope(userSchema, data)
}
