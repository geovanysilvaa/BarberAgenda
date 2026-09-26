import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Falha rápido com uma mensagem que diz exatamente qual variável está
// faltando/inválida, em vez do erro genérico do supabase-js — evita
// perder tempo com o app crashando na inicialização em deploy (Render,
// etc) sem saber qual env var revisar.
if (!supabaseUrl || !/^https?:\/\//i.test(supabaseUrl)) {
  throw new Error(
    `SUPABASE_URL ausente ou inválida (valor atual: ${JSON.stringify(supabaseUrl)}). Confira a variável de ambiente.`
  )
}
if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY ausente. Confira a variável de ambiente.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)