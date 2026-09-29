import { ApiRequestError } from './envelope'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
export const AUTH_TOKEN_KEY = 'sih_auth_token'

export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>
  responseType?: 'json' | 'blob'
  body?: unknown
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { params, responseType = 'json', ...customConfig } = options
  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  const headers: Record<string, string> = {
    ...(customConfig.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (customConfig.body && !(customConfig.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    customConfig.body = JSON.stringify(customConfig.body)
  }

  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  let response: Response
  try {
    response = await fetch(url, { ...customConfig, headers, body: customConfig.body as BodyInit | undefined })
  } catch {
    // Network errors (e.g. CORS, DNS)
    throw new Error('Network error or API unreachable')
  }

  if (response.status === 204) {
    return {} as T
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')

  if (!response.ok) {
    let code = `HTTP_${response.status}`
    let message = response.statusText || `Request failed with status ${response.status}`

    if (isJson) {
      const errorData = await response.json()
      if (errorData.success === false && errorData.error) {
        code = errorData.error.code || code
        message = errorData.error.message || message
      } else {
        message = errorData.message || message
      }
    } else {
      const text = await response.text()
      message = text || message
    }

    if (response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      if (endpoint !== '/auth/me') window.location.assign('/login')
    }

    throw new ApiRequestError(code, message)
  }

  if (responseType === 'blob') {
    return (await response.blob()) as unknown as T
  }

  if (!isJson) {
    const text = await response.text()
    return text as unknown as T
  }

  const payload = await response.json()
  return payload as T
}
