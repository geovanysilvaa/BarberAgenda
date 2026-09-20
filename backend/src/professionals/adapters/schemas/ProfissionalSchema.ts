import { z } from 'zod'

export const cadastrarProfissionalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(150),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  specialty: z.string().max(100).optional(),
  avatarUrl: z.string().optional().nullable(),
})

export const atualizarProfissionalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(150).optional(),
  phone: z.string().min(10, 'Telefone inválido').max(20).optional(),
  specialty: z.string().max(100).optional(),
  avatarUrl: z.string().optional().nullable(),
})

export const tornarSeProfissionalSchema = z.object({
  specialty: z.string().max(100).optional(),
  avatarUrl: z.string().optional().nullable(),
})
