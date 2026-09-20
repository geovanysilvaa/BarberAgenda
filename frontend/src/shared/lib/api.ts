const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  let data: any = null
  const contentType = response.headers.get('content-type') || ''
  if (response.status !== 204) {
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }
    }
  }

  if (!response.ok) {
    let message = data?.message || 'Erro inesperado no servidor.'
    if (data?.details && typeof data.details === 'object') {
      const errorList = Object.values(data.details).flat().filter(Boolean)
      if (errorList.length > 0) message = errorList.join(' ')
    }
    if (typeof message === 'string' && message.trim().startsWith('<')) {
      message = `O servidor retornou erro HTTP ${response.status} (${response.statusText || 'Não encontrado'}). Verifique a rota da API ou se o backend está online.`
    }
    throw new ApiError(message, data?.error ?? 'UNKNOWN_ERROR', response.status)
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
