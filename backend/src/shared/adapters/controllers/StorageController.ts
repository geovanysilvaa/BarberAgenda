import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../../shared/errors/AppError'
import { StorageService, UploadValidationError, StorageFolder } from '../../../shared/infrastructure/StorageService'

const storageService = new StorageService()

const FOLDER_ALLOWED: StorageFolder[] = ['barbershops', 'services', 'professionals', 'users']

export class StorageController {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new AppError('Usuário não autenticado.', 401, 'UNAUTHORIZED')
      }

      const rawFolder = (req.body.folder as string | undefined)?.trim() || ''
      const folder = rawFolder as StorageFolder
      if (!FOLDER_ALLOWED.includes(folder)) {
        throw new AppError(
          `Pasta inválida "${rawFolder}". Use: ${FOLDER_ALLOWED.join(', ')}`,
          400,
          'INVALID_FOLDER'
        )
      }

      const id = (req.body.id as string | undefined)?.trim() || undefined
      const fileNamePrefix = (req.body.fileNamePrefix as string | undefined)?.trim() || undefined

      const file = (req as unknown as { file?: Express.Multer.File }).file
      if (!file) {
        throw new AppError('Nenhum arquivo enviado no campo "file".', 400, 'NO_FILE')
      }

      const result = await storageService.uploadImage({
        file: {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          buffer: file.buffer,
          size: file.size,
        },
        folder,
        id,
        fileNamePrefix,
      })

      res.status(201).json({
        url: result.url,
        path: result.path,
        fileName: result.fileName,
        size: result.size,
        mimetype: result.mimetype,
      })
    } catch (err: unknown) {
      if (err instanceof UploadValidationError) {
        next(new AppError(err.message, 400, 'INVALID_FILE'))
        return
      }
      if (err instanceof AppError) {
        next(err)
        return
      }
      const msg = err instanceof Error ? err.message : 'Erro inesperado ao enviar arquivo.'
      next(new AppError(msg, 500, 'UPLOAD_ERROR'))
    }
  }
}
