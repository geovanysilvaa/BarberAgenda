import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../model/useAuth'
import { ErrorMessage } from '../../../shared/ui/ErrorMessage'
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner'
import { ApiError } from '../../../shared/lib/api'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data.email, data.password)
      navigate('/barbershops')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full">
      {/* Campo E-mail */}
      <div className="flex flex-col w-full">
        <label
          htmlFor="login-email"
          className="block pl-0.5 mb-1.5 text-[15px] font-semibold text-[#6d5bd9]"
        >
          E-mail
        </label>
        <div className="relative">
          <input
            id="login-email"
            type="email"
            placeholder="cliente@barberagenda.com"
            autoComplete="email"
            className={`
              w-full block
              px-4 py-4
              bg-white
              text-[#1a1a1a] text-[17px]
              placeholder:text-[#9a95a8]
              border-2 transition-all duration-200
              rounded-xl
              focus:outline-none
              ${errors.email
                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
                : 'border-[#c8c1db] hover:border-[#a9a0c4] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/18'
              }
            `}
            {...register('email')}
          />
        </div>
        <div className="min-h-[1.1rem] pl-0.5 mt-1">
          {errors.email && (
            <span className="text-[0.78rem] font-semibold text-red-600 flex items-center gap-1">
              {errors.email.message}
            </span>
          )}
        </div>
      </div>

      {/* Campo Senha */}
      <div className="flex flex-col w-full">
        <label
          htmlFor="login-password"
          className="block pl-0.5 mb-1.5 text-[15px] font-semibold text-[#6d5bd9]"
        >
          Senha
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={mostrarSenha ? 'text' : 'password'}
            placeholder="••••••••••••"
            autoComplete="current-password"
            className={`
              w-full block
              px-4 py-4 pr-12
              bg-white
              text-[#1a1a1a] text-[17px]
              placeholder:text-[#9a95a8]
              border-2 transition-all duration-200
              rounded-xl
              focus:outline-none
              ${errors.password
                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
                : 'border-[#c8c1db] hover:border-[#a9a0c4] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/18'
              }
            `}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            tabIndex={-1}
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6778] hover:text-[#6d5bd9] transition-colors p-1 -m-1 rounded-md"
          >
            {mostrarSenha ? (
              <EyeOff size={22} strokeWidth={1.9} />
            ) : (
              <Eye size={22} strokeWidth={1.9} />
            )}
          </button>
        </div>
        <div className="min-h-[1.1rem] pl-0.5 mt-1">
          {errors.password && (
            <span className="text-[0.78rem] font-semibold text-red-600 flex items-center gap-1">
              {errors.password.message}
            </span>
          )}
        </div>
      </div>

      {/* Esqueceu a senha */}
      <Link
        to="/recover-password"
        className="text-[15px] text-[#6d5bd9] font-semibold hover:underline self-end -mt-1"
      >
        Esqueceu a senha?
      </Link>

      {/* Erro geral */}
      {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}

      {/* Botão Entrar */}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting || undefined}
        className={`
          w-full inline-flex items-center justify-center gap-2
          px-6 py-4
          text-white text-[18px] font-semibold tracking-tight
          bg-[#6d5bd9]
          rounded-full
          transition-all duration-220 ease-[cubic-bezier(0.16,1,0.3,1)]
          border border-transparent
          shadow-[0_10px_22px_-10px_rgba(109,91,217,0.55)]
          hover:bg-[#5d4bc9] hover:-translate-y-[1px] hover:shadow-[0_14px_28px_-10px_rgba(109,91,217,0.65)]
          active:translate-y-[0px] active:shadow-[0_4px_14px_-6px_rgba(109,91,217,0.55)]
          disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none
        `}
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" tone="white" />
            <span className="opacity-85">Entrando…</span>
          </>
        ) : (
          <span>Entrar</span>
        )}
      </button>
    </form>
  )
}
