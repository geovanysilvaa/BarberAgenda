import { Router } from 'express'
import multer from 'multer'
import { StorageController } from '../controllers/StorageController'
import { autenticar } from '../../../shared/middlewares/autenticar'

const MAX_SIZE_BYTES = 5 * 1024 * 1024

const memoryStorage = multer.memoryStorage()
const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_SIZE_BYTES, files: 1 },
})

const storageController = new StorageController()

/**
 * Rotas de upload de imagem via backend (service role do Supabase, ignora RLS).
 * Monta-se em /api/v1/storage.
 *
 * Exemplo:
 *   POST /api/v1/storage/upload
 *   Content-Type: multipart/form-data
 *   Body (FormData):
 *     file            <arquivo binário> (obrigatório)
 *     folder          'barbershops' | 'services' | 'professionals' | 'users'
 *     id              string (opcional — id da barbearia/serviço/profissional/usuário)
 *     fileNamePrefix  string (opcional — ex: "fachada" ou "corte-degrade")
 *
 * Retorno (201): { url, path, fileName, size, mimetype }
 */
export function routerStorage(): Router {
  const router = Router()

  router.post(
    '/upload',
    autenticar,
    upload.single('file'),
    (req, res, next) => storageController.upload(req, res, next)
  )

  return router
}
