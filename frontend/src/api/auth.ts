import { delay, findUserByCredentials, findUserById } from '@/mocks/mockStore'
import { parseEnvelope, ApiRequestError } from './envelope'
import { loginResponseSchema, userSchema, type LoginInput, type LoginResponse, type User } from '@/schemas/auth'

/**
 * Structurally realistic fake JWT: base64url header/payload/signature so the
 * shape matches a real token and swapping in a real backend later doesn't
 * change how consumers decode it.
 */
function issueToken(user: { id: string; role: string }): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({ sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 3600 }),
  )
  return `${header}.${payload}.mock-signature`
}

export function decodeToken(token: string): { sub: string; role: string; exp: number } | null {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  await delay()
  const user = findUserByCredentials(input.username, input.password)
  if (!user) {
    return parseEnvelope(loginResponseSchema, {
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Username or password is incorrect' },
    })
  }
  return parseEnvelope(loginResponseSchema, {
    success: true,
    data: {
      access_token: issueToken(user),
      token_type: 'bearer',
      expires_in: 3600,
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
    },
  })
}

export async function getMe(token: string): Promise<User> {
  await delay(150)
  const decoded = decodeToken(token)
  const user = decoded ? findUserById(decoded.sub) : undefined
  if (!user) {
    throw new ApiRequestError('UNAUTHENTICATED', 'Session is invalid or has expired')
  }
  return parseEnvelope(userSchema, {
    success: true,
    data: { id: user.id, name: user.name, username: user.username, role: user.role },
  })
}
