import { supabase } from '../database/supabase'
import { randomUUID } from 'node:crypto'

const BUCKET = 'uploads'
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export type StorageFolder = 'barbershops' | 'services' | 'professionals' | 'users'

export interface UploadedFileInfo {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
}

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadValidationError'
  }
}

function sanitizeFileName(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return base || 'file'
}

function validateFile(file: UploadedFileInfo): void {
  if (!file) {
    throw new UploadValidationError('Nenhum arquivo enviado.')
  }

  if (!VALID_TYPES.includes(file.mimetype)) {
    throw new UploadValidationError(
      `Tipo de arquivo inválido (${file.mimetype}). Use JPG, PNG, WEBP ou GIF.`
    )
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError(
      `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Tamanho máximo: 5MB.`
    )
  }

  if (file.size === 0) {
    throw new UploadValidationError('Arquivo vazio enviado.')
  }
}

export interface StorageUploadResult {
  url: string
  path: string
  fileName: string
  size: number
  mimetype: string
}

export class StorageService {
  private bucket = BUCKET

  async uploadImage(params: {
    file: UploadedFileInfo
    folder: StorageFolder
    id?: string
    fileNamePrefix?: string
  }): Promise<StorageUploadResult> {
    const { file, folder, id, fileNamePrefix } = params
    validateFile(file)

    const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase()
    const safeExt = VALID_TYPES.some((t) => t.includes(ext)) ? ext : 'jpg'
    const cleanName = sanitizeFileName(fileNamePrefix || file.originalname.replace(/\.[^.]+$/, ''))
    const folderIdPart = id ? sanitizeFileName(String(id)) : 'temp'
    const unique = randomUUID().slice(0, 8)
    const finalName = `${cleanName}-${unique}.${safeExt}`

    const path = `${folder}/${folderIdPart}/${finalName}`

    const { error } = await supabase.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
        cacheControl: '3600',
      })

    if (error) {
      throw new Error(`Erro ao enviar arquivo para Storage: ${error.message}`)
    }

    const { data: urlData } = supabase.storage.from(this.bucket).getPublicUrl(path)
    if (!urlData?.publicUrl) {
      throw new Error('Não foi possível obter a URL pública do arquivo enviado.')
    }

    return {
      url: urlData.publicUrl,
      path,
      fileName: finalName,
      size: file.size,
      mimetype: file.mimetype,
    }
  }

  async removeObject(path: string): Promise<boolean> {
    if (!path) return false
    const { error } = await supabase.storage.from(this.bucket).remove([path])
    return !error
  }
}
