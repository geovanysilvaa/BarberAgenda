import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock } from 'lucide-react'
import { api, ApiError } from '../../../shared/lib/api'
import { ErrorMessage } from '../../../shared/ui/ErrorMessage'
import { SuccessMessage } from '../../../shared/ui/SuccessMessage'
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner'

const recoverPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>

export function RecoverPasswordForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RecoverPasswordFormData>({ resolver: zodResolver(recoverPasswordSchema) })

  async function onSubmit(data: RecoverPasswordFormData) {
    try {
      const { message } = await api.post<{ message: string }>('/auth/recover-password', data)
      setSuccessMessage(message)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Não foi possível enviar o link. Tente novamente.'
      setError('root', { message })
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-center pt-1">
        <div
          className="w-[150px] h-[150px] rounded-full flex items-center justify-center"
          style={{ background: '#e4dcff' }}
        >
          <div
            className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
            style={{ background: 'transparent' }}
          >
            <Lock size={72} strokeWidth={1.6} className="text-[#6d5bd9]" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <h2
          className="font-extrabold tracking-tight text-[#1a1722] leading-tight"
          style={{ fontSize: '20px', letterSpacing: '-0.01em' }}
        >
          Esqueceu seus dados de acesso?
        </h2>
        <p
          className="leading-relaxed"
          style={{ color: '#6b6478', fontSize: '15px' }}
        >
          Insira o e-mail cadastrado abaixo. Enviaremos um link seguro para você redefinir sua senha de acesso.
        </p>
      </div>

      {successMessage ? (
        <SuccessMessage>{successMessage}</SuccessMessage>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-1" noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              className="font-semibold tracking-tight"
              style={{ color: '#6d5bd9', fontSize: '15px' }}
            >
              E-mail
            </label>
            <input
              type="email"
              autoComplete="email"
              className={[
                'w-full bg-[#fef7ff] border rounded-[14px]',
                'font-bold tracking-tight text-[#1a1722]',
                'placeholder:text-[#b7b0ca]',
                'transition-all duration-150 outline-none',
                errors.email
                  ? 'border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
                  : 'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
              ].join(' ')}
              style={{ padding: '13px 18px', fontSize: '19px' }}
              placeholder="Digite seu e-mail cadastrado"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-[13px] font-semibold text-red-600 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={[
                'w-full inline-flex items-center justify-center gap-2',
                'text-white font-extrabold tracking-tight transition-all duration-150',
                'shadow-[0_8px_20px_-6px_rgba(109,91,217,0.55)]',
                isSubmitting
                  ? 'bg-[#b9b0d4] cursor-wait shadow-none'
                  : 'bg-[#6d5bd9] hover:bg-[#5d4bc9] active:scale-[0.992]',
              ].join(' ')}
              style={{ padding: '16px 20px', borderRadius: '999px', fontSize: '19px' }}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" tone="white" />
                  Enviando...
                </>
              ) : (
                'Enviar link'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
