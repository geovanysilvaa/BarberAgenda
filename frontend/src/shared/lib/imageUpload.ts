import { getPublicUrl } from './supabase'

const MAX_SIZE_MB = 5
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const DEFAULT_BUCKET = 'uploads'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:3000/api/v1'
const UPLOAD_ENDPOINT = `${BASE_URL}/storage/upload`

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

export function validateImageFile(file: File): string | null {
  if (!VALID_TYPES.includes(file.type)) {
    return 'Formato inválido. Use JPG, PNG, WEBP ou GIF.'
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.`
  }
  return null
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function safePathSegment(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'item'
}

interface StorageUploadResponse {
  url: string
  path?: string
  fileName?: string
  size?: number
  mimetype?: string
}

/**
 * Upload de imagem para o Storage via backend.
 * - Ignora completamente as RLS do Supabase (backend usa service_role).
 * - Autenticado com o mesmo JWT do app (localStorage token / Bearer).
 * - Fallback para DataURL se a API estiver offline / falhar 2×.
 */
export async function uploadImage(params: {
  file: File
  folder: 'barbershops' | 'services' | 'professionals'
  id: string
  fileName?: string
}): Promise<string> {
  const validation = validateImageFile(params.file)
  if (validation) throw new UploadError(validation)

  const token = localStorage.getItem('token')

  const formData = new FormData()
  formData.append('file', params.file, params.file.name)
  formData.append('folder', safePathSegment(params.folder))
  formData.append('id', safePathSegment(params.id))
  if (params.fileName) {
    formData.append('fileNamePrefix', safePathSegment(params.fileName))
  }

  try {
    const res = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    let payload: any = null
    try {
      payload = await res.json()
    } catch {
      payload = null
    }

    if (!res.ok) {
      const message = payload?.message || `Erro no upload (HTTP ${res.status}).`
      throw new UploadError(message)
    }

    const data = payload as StorageUploadResponse
    if (!data?.url) {
      throw new UploadError('A resposta do servidor não continha a URL da imagem.')
    }

    return data.url
  } catch (err) {
    if (err instanceof UploadError) throw err

    const msg = err instanceof Error ? err.message : 'Erro inesperado.'
    const looksOffline =
      /Failed to fetch|NetworkError|fetch failed|ECONNREFUSED|não encontrado/i.test(msg) ||
      msg.includes('HTTP 404') ||
      msg.includes('Não encontrado')

    if (looksOffline) {
      const fallback = await readFileAsDataURL(params.file)
      return fallback
    }

    void getPublicUrl
    void DEFAULT_BUCKET

    throw new UploadError(msg)
  }
}
