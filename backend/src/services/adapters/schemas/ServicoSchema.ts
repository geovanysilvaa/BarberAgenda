import { z } from 'zod'

export const cadastrarServicoSchema = z.object({
  name: z.string().min(2, 'Nome do serviço deve ter pelo menos 2 caracteres').max(150),
  description: z.string().max(500).optional(),
  durationMinutes: z
    .number()
    .int('Duração deve ser um número inteiro de minutos')
    .positive('Duração deve ser maior que zero'),
  price: z.number().nonnegative('Preço não pode ser negativo'),
  imageUrl: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
})

export const atualizarServicoSchema = z.object({
  name: z.string().min(2, 'Nome do serviço deve ter pelo menos 2 caracteres').max(150).optional(),
  description: z.string().max(500).optional(),
  durationMinutes: z
    .number()
    .int('Duração deve ser um número inteiro de minutos')
    .positive('Duração deve ser maior que zero')
    .optional(),
  price: z.number().nonnegative('Preço não pode ser negativo').optional(),
  imageUrl: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
})
