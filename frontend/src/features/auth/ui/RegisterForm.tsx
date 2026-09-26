import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { api, ApiError } from '../../../shared/lib/api'
import { ErrorMessage } from '../../../shared/ui/ErrorMessage'
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome muito curto').max(150),
    email: z.string().email('E-mail inválido'),
    phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)').max(20),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(80),
    confirmPassword: z.string().max(80),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess?: (credentials: { email: string; password: string }) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps = {}) {
  const navigate = useNavigate()

  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const watchedPhone = watch('phone')

  async function onSubmit(data: RegisterFormData) {
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })

      if (onSuccess) {
        onSuccess({ email: data.email, password: data.password })
      } else {
        navigate('/login')
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Não foi possível cadastrar. Tente novamente.'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label
          className="font-semibold tracking-tight"
          style={{ color: '#6d5bd9', fontSize: '15px' }}
        >
          Nome completo
        </label>
        <input
          type="text"
          autoComplete="name"
          className={[
            'w-full bg-[#fef7ff] border rounded-[14px]',
            'font-bold tracking-tight text-[#1a1722]',
            'placeholder:text-[#b7b0ca]',
            'transition-all duration-150 outline-none',
            errors.name
              ? 'border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
              : 'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
          ].join(' ')}
          style={{ padding: '13px 18px', fontSize: '19px' }}
          placeholder="Ex: Lucas Silva"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-[13px] font-semibold text-red-600 pl-1">{errors.name.message}</p>
        )}
      </div>

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
          placeholder="Ex: seuemail@provedor.com"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-[13px] font-semibold text-red-600 pl-1">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="font-semibold tracking-tight"
          style={{ color: '#6d5bd9', fontSize: '15px' }}
        >
          Telefone
        </label>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={[
            'w-full bg-[#fef7ff] border rounded-[14px]',
            'font-bold tracking-tight text-[#1a1722]',
            'placeholder:text-[#b7b0ca]',
            'transition-all duration-150 outline-none',
            errors.phone
              ? 'border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
              : 'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
          ].join(' ')}
          style={{ padding: '13px 18px', fontSize: '19px' }}
          placeholder="Ex: (11) 99999-9999"
          value={watchedPhone ?? ''}
          onChange={(e) => {
            let v = e.target.value.replace(/\D/g, '').slice(0, 11)
            if (v.length >= 7) {
              v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
            } else if (v.length >= 2) {
              v = `(${v.slice(0, 2)}) ${v.slice(2)}`
            }
            e.target.value = v
            register('phone').onChange(e)
          }}
          onBlur={register('phone').onBlur}
          name="phone"
          ref={register('phone').ref}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && (
          <p className="text-[13px] font-semibold text-red-600 pl-1">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="font-semibold tracking-tight"
          style={{ color: '#6d5bd9', fontSize: '15px' }}
        >
          Senha
        </label>
        <div className="relative">
          <input
            type={mostrarSenha ? 'text' : 'password'}
            autoComplete="new-password"
            className={[
              'w-full bg-[#fef7ff] border rounded-[14px]',
              'font-bold tracking-tight text-[#1a1722]',
              'placeholder:text-[#b7b0ca]',
              'transition-all duration-150 outline-none pr-14',
              errors.password
                ? 'border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
                : 'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
            ].join(' ')}
            style={{ padding: '13px 18px', fontSize: '19px' }}
            placeholder="Crie uma senha forte"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={-1}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6478] hover:text-[#6d5bd9] transition-colors p-1.5 -m-1.5 rounded-md"
          >
            {mostrarSenha ? <EyeOff size={22} strokeWidth={1.9} /> : <Eye size={22} strokeWidth={1.9} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[13px] font-semibold text-red-600 pl-1">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          className="font-semibold tracking-tight"
          style={{ color: '#6d5bd9', fontSize: '15px' }}
        >
          Confirmar senha
        </label>
        <div className="relative">
          <input
            type={mostrarConfirmacao ? 'text' : 'password'}
            autoComplete="new-password"
            className={[
              'w-full bg-[#fef7ff] border rounded-[14px]',
              'font-bold tracking-tight text-[#1a1722]',
              'placeholder:text-[#b7b0ca]',
              'transition-all duration-150 outline-none pr-14',
              errors.confirmPassword
                ? 'border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
                : 'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
            ].join(' ')}
            style={{ padding: '13px 18px', fontSize: '19px' }}
            placeholder="Repita a senha criada"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmacao((v) => !v)}
            aria-label={mostrarConfirmacao ? 'Ocultar confirmação' : 'Mostrar confirmação'}
            tabIndex={-1}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6478] hover:text-[#6d5bd9] transition-colors p-1.5 -m-1.5 rounded-md"
          >
            {mostrarConfirmacao ? <EyeOff size={22} strokeWidth={1.9} /> : <Eye size={22} strokeWidth={1.9} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-[13px] font-semibold text-red-600 pl-1">
            {errors.confirmPassword.message}
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
              Cadastrando...
            </>
          ) : (
            'Cadastrar'
          )}
        </button>
      </div>
    </form>
  )
}
