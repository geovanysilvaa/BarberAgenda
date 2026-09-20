import { createClient } from '@supabase/supabase-js'
import https from 'node:https'
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

// Keep-alive reduz o custo de handshake TLS em cada requisição ao Supabase.
// Em ambientes como a Render free, cada nova conexão pode somar dezenas de ms.
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 10_000,
  maxSockets: 50,
  timeout: 30_000,
})

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Servidor não precisa persistir sessão em disco — evita I/O desnecessário.
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    // @ts-expect-error — `agent` não está nos tipos públicos do fetch,
    // mas o Node.js (undici/fetch nativo) aceita para reaproveitar sockets.
    fetch: (input, init) => fetch(input, { ...init, agent: httpsAgent, signal: init?.signal ?? AbortSignal.timeout(30_000) }),
  },
})