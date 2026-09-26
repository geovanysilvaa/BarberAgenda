import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Eye,
  EyeOff,
  LogOut,
  CalendarClock,
  Ban,
  ChevronRight,
  Store,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../features/auth/model/useAuth'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { SuccessMessage } from '../shared/ui/SuccessMessage'
import { ApiError } from '../shared/lib/api'
import { BottomNav } from '../shared/ui/BottomNav'

const MESES_NOME = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
] as const

const perfilSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(150),
  phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)').max(20),
  newPassword: z
    .string()
    .max(80)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' ? undefined : v)),
  currentPassword: z.string().max(80).optional().or(z.literal('')),
})
.refine(
  (dados) => {
    const temSenhaAtual = !!dados.currentPassword && dados.currentPassword.length > 0
    const temNovaSenha = !!dados.newPassword && dados.newPassword.length > 0
    if (!temSenhaAtual && !temNovaSenha) return true
    if (temSenhaAtual && temNovaSenha) return (dados.newPassword?.length ?? 0) >= 8
    return false
  },
  {
    message: 'Preencha senha atual e nova senha (mínimo 8 caracteres) para trocá-la.',
    path: ['newPassword'],
  },
)

type PerfilFormData = z.infer<typeof perfilSchema>

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, loading: loadingAuth, atualizarUsuario, logout } = useAuth()

  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [saindo, setSaindo] = useState(false)

  const defaultValues = useMemo<PerfilFormData>(
    () => ({
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      currentPassword: '',
      newPassword: '',
    }),
    [user?.name, user?.phone],
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(perfilSchema),
    defaultValues,
  })

  useEffect(() => {
    if (user) reset(defaultValues)
  }, [user, reset, defaultValues])

  const watchedName = watch('name')
  const watchedPhone = watch('phone')

  const dataMembro = useMemo(() => {
    if (!user?.createdAt) return 'desde o início'
    const d = new Date(user.createdAt)
    const mes = MESES_NOME[d.getMonth()]
    return `${mes} ${d.getFullYear()}`
  }, [user?.createdAt])

  async function onSubmit(dados: PerfilFormData) {
    setErro(null)
    setSucesso(null)
    try {
      const payload: {
        name: string
        phone: string
        currentPassword?: string
        newPassword?: string
      } = {
        name: dados.name.trim(),
        phone: dados.phone,
      }
      if (dados.currentPassword && dados.newPassword) {
        payload.currentPassword = dados.currentPassword
        payload.newPassword = dados.newPassword
      }
      await atualizarUsuario(payload)
      setSucesso(
        dados.newPassword
          ? 'Dados e senha atualizados com sucesso!'
          : 'Dados pessoais atualizados com sucesso!',
      )
      reset({
        name: payload.name,
        phone: payload.phone,
        currentPassword: '',
        newPassword: '',
      })
      setMostrarSenhaAtual(false)
      setMostrarNovaSenha(false)
      setTimeout(() => setSucesso(null), 4500)
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível salvar suas alterações. Tente novamente.',
      )
    }
  }

  const podeSalvar = !isSubmitting && isDirty

  async function handleLogout() {
    setSaindo(true)
    setErro(null)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setSaindo(false)
      setErro(
        err instanceof ApiError ? err.message : 'Não foi possível sair. Tente novamente.',
      )
    }
  }

  if (loadingAuth && !user) {
    return (
      <div className="min-h-screen bg-[#fef7ff] pb-40 md:pb-8">
        <div className="max-w-md mx-auto px-5 py-20 flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" tone="selected" />
          <p className="text-sm text-[#6b6778]">Carregando seu perfil...</p>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#fef7ff] pb-40 md:pb-8">
      <main
        className="max-w-md mx-auto px-5 pt-8 pb-4 flex flex-col gap-6"
      >
        <h1
          className="font-extrabold tracking-tight text-[#1a1722]"
          style={{ fontSize: '31px', letterSpacing: '-0.02em' }}
        >
          Meu perfil
        </h1>

        <section className="flex flex-col items-center gap-3 pt-2 pb-2">
          <div
            className="w-[118px] h-[118px] rounded-full p-[4px]"
            style={{ background: 'linear-gradient(135deg, #6d5bd9 0%, #8b7fe9 100%)' }}
          >
            <div className="w-full h-full rounded-full bg-[#efe8ff] overflow-hidden flex items-center justify-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`Foto de ${user.name}`}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <UserIcon
                  size={50}
                  strokeWidth={1.7}
                  className="text-[#6d5bd9]"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 pt-1">
            <h2
              className="font-extrabold tracking-tight text-[#1a1722] leading-tight"
              style={{ fontSize: '26px', letterSpacing: '-0.015em' }}
            >
              {watchedName || user.name}
            </h2>
            <p
              className="tracking-tight"
              style={{ color: '#6b6478', fontSize: '16px' }}
            >
              Membro desde {dataMembro}
            </p>
          </div>
        </section>

        {(user.roles.includes('profissional') || user.roles.includes('owner')) && (
          <section className="flex flex-col gap-3">
            <h3
              className="font-bold tracking-tight text-[#6d5bd9] px-1"
              style={{ fontSize: '15px', letterSpacing: '0.02em' }}
            >
              FERRAMENTAS
            </h3>

            {user.roles.includes('profissional') && (
              <>
                <Link
                  to="/professional/schedule"
                  className="w-full bg-white rounded-[22px] p-5 shadow-[0_1px_2px_rgba(18,17,51,0.04),0_8px_24px_-8px_rgba(109,91,217,0.12)] border border-[#efe8ff] hover:border-[#d6cdf8] transition-all active:scale-[0.995]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] bg-[#efe8ff] text-[#6d5bd9] flex items-center justify-center shrink-0">
                      <CalendarClock size={24} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[19px] font-bold text-[#2b2238] leading-tight">
                        Minha Agenda
                      </div>
                      <div className="text-[15px] text-[#6b6478] mt-0.5 truncate">
                        Veja e gerencie seus atendimentos do dia
                      </div>
                    </div>
                    <ChevronRight size={22} strokeWidth={1.9} className="text-[#c8c1d6] shrink-0" />
                  </div>
                </Link>

                <Link
                  to="/professional/unavailability"
                  className="w-full bg-white rounded-[22px] p-5 shadow-[0_1px_2px_rgba(18,17,51,0.04),0_8px_24px_-8px_rgba(109,91,217,0.12)] border border-[#efe8ff] hover:border-[#d6cdf8] transition-all active:scale-[0.995]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] bg-[#f4efff] text-[#6d5bd9] flex items-center justify-center shrink-0">
                      <Ban size={24} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[19px] font-bold text-[#2b2238] leading-tight">
                        Indisponibilidades
                      </div>
                      <div className="text-[15px] text-[#6b6478] mt-0.5 truncate">
                        Bloqueie horários de almoço, folgas e afazeres
                      </div>
                    </div>
                    <ChevronRight size={22} strokeWidth={1.9} className="text-[#c8c1d6] shrink-0" />
                  </div>
                </Link>
              </>
            )}

            {user.roles.includes('owner') && (
              <Link
                to="/owner/barbershops"
                className="w-full bg-white rounded-[22px] p-5 shadow-[0_1px_2px_rgba(18,17,51,0.04),0_8px_24px_-8px_rgba(109,91,217,0.12)] border border-[#efe8ff] hover:border-[#d6cdf8] transition-all active:scale-[0.995]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[18px] bg-[#fff3e0] text-[#c57e0a] flex items-center justify-center shrink-0">
                    <Store size={24} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[19px] font-bold text-[#2b2238] leading-tight">
                      Minhas Barbearias
                    </div>
                    <div className="text-[15px] text-[#6b6478] mt-0.5 truncate">
                      Gerencie suas barbearias, equipes e serviços
                    </div>
                  </div>
                  <ChevronRight size={22} strokeWidth={1.9} className="text-[#c8c1d6] shrink-0" />
                </div>
              </Link>
            )}
          </section>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <section
            className="bg-[#efe8ff] flex flex-col gap-4"
            style={{ padding: '20px 22px 24px', borderRadius: '22px' }}
          >
            <h3
              className="font-bold tracking-tight text-[#6d5bd9]"
              style={{ fontSize: '17px', letterSpacing: '0.01em' }}
            >
              DADOS PESSOAIS
            </h3>

            <div className="flex flex-col gap-4">
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
                    'w-full bg-transparent border rounded-[14px]',
                    'font-bold tracking-tight text-[#1a1722]',
                    'placeholder:text-[#b7b0ca]',
                    'transition-all duration-150 outline-none',
                    errors.name
                      ? 'border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
                      : 'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15 bg-white/40',
                  ].join(' ')}
                  style={{
                    padding: '13px 18px',
                    fontSize: '19px',
                  }}
                  placeholder="Nome completo"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-[13px] font-semibold text-red-600 pl-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="font-semibold tracking-tight"
                  style={{ color: '#6d5bd9', fontSize: '15px' }}
                >
                  Telefone celular
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className={[
                    'w-full bg-transparent border rounded-[14px]',
                    'font-bold tracking-tight text-[#1a1722]',
                    'placeholder:text-[#b7b0ca]',
                    'transition-all duration-150 outline-none',
                    errors.phone
                      ? 'border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
                      : 'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15 bg-white/40',
                  ].join(' ')}
                  style={{
                    padding: '13px 18px',
                    fontSize: '19px',
                  }}
                  placeholder="(11) 98765-4321"
                  value={watchedPhone}
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
                  <p className="text-[13px] font-semibold text-red-600 pl-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="font-semibold tracking-tight"
                  style={{ color: '#6d5bd9', fontSize: '15px' }}
                >
                  E-mail (somente leitura)
                </label>
                <input
                  type="email"
                  readOnly
                  disabled
                  className={[
                    'w-full border rounded-[14px]',
                    'font-bold tracking-tight text-[#1a1722]',
                    'bg-white/40 opacity-95 cursor-not-allowed',
                    'transition-all duration-150 outline-none',
                    'border-[#c2b8d6]',
                  ].join(' ')}
                  style={{
                    padding: '13px 18px',
                    fontSize: '19px',
                  }}
                  value={user.email}
                />
              </div>
            </div>
          </section>

          <section
            className="bg-[#efe8ff] flex flex-col gap-4"
            style={{ padding: '20px 22px 24px', borderRadius: '22px' }}
          >
            <h3
              className="font-bold tracking-tight text-[#6d5bd9]"
              style={{ fontSize: '17px', letterSpacing: '0.01em' }}
            >
              TROCAR SENHA
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-semibold tracking-tight"
                  style={{ color: '#6d5bd9', fontSize: '15px' }}
                >
                  Senha atual
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenhaAtual ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={[
                      'w-full bg-transparent border rounded-[14px]',
                      'font-bold tracking-tight text-[#1a1722]',
                      'placeholder:text-[#b7b0ca]',
                      'transition-all duration-150 outline-none',
                      errors.currentPassword
                        ? 'border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15 pr-14'
                        : 'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15 bg-white/40 pr-14',
                    ].join(' ')}
                    style={{
                      padding: '13px 18px',
                      fontSize: '19px',
                    }}
                    placeholder="Senha atual"
                    {...register('currentPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenhaAtual((v) => !v)}
                    aria-label={mostrarSenhaAtual ? 'Ocultar senha atual' : 'Mostrar senha atual'}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6478] hover:text-[#6d5bd9] transition-colors p-1.5 -m-1.5 rounded-md"
                  >
                    {mostrarSenhaAtual ? (
                      <EyeOff size={22} strokeWidth={1.9} />
                    ) : (
                      <Eye size={22} strokeWidth={1.9} />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-[13px] font-semibold text-red-600 pl-1">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="font-semibold tracking-tight"
                  style={{ color: '#6d5bd9', fontSize: '15px' }}
                >
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    type={mostrarNovaSenha ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={[
                      'w-full bg-transparent border rounded-[14px]',
                      'font-bold tracking-tight text-[#1a1722]',
                      'placeholder:text-[#b7b0ca]',
                      'transition-all duration-150 outline-none',
                      errors.newPassword
                        ? 'border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15 pr-14'
                        : 'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15 bg-white/40 pr-14',
                    ].join(' ')}
                    style={{
                      padding: '13px 18px',
                      fontSize: '19px',
                    }}
                    placeholder="Digite a nova senha"
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarNovaSenha((v) => !v)}
                    aria-label={mostrarNovaSenha ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6478] hover:text-[#6d5bd9] transition-colors p-1.5 -m-1.5 rounded-md"
                  >
                    {mostrarNovaSenha ? (
                      <EyeOff size={22} strokeWidth={1.9} />
                    ) : (
                      <Eye size={22} strokeWidth={1.9} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-[13px] font-semibold text-red-600 pl-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {erro && <ErrorMessage>{erro}</ErrorMessage>}
          {sucesso && <SuccessMessage>{sucesso}</SuccessMessage>}

          <div className="pt-1">
            <button
              type="submit"
              disabled={!podeSalvar}
              className={[
                'w-full inline-flex items-center justify-center gap-2',
                'text-white font-extrabold tracking-tight transition-all duration-150',
                'shadow-[0_8px_20px_-6px_rgba(109,91,217,0.55)]',
                podeSalvar
                  ? 'bg-[#6d5bd9] hover:bg-[#5d4bc9] active:scale-[0.992]'
                  : 'bg-[#b9b0d4] cursor-not-allowed shadow-none',
              ].join(' ')}
              style={{
                padding: '16px 20px',
                borderRadius: '999px',
                fontSize: '19px',
              }}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" tone="white" />
                  Salvando...
                </>
              ) : (
                'Salvar alterações'
              )}
            </button>
          </div>
        </form>

        <div className="pt-2 flex">
          <button
            type="button"
            onClick={handleLogout}
            disabled={saindo}
            className={[
              'w-full inline-flex items-center justify-center gap-2',
              'font-bold tracking-tight transition-all duration-150',
              'rounded-[999px] border-2',
              saindo
                ? 'opacity-70 cursor-wait'
                : 'text-[#c94e4e] border-[#d95e5e] bg-white hover:bg-[#fff2f2] active:scale-[0.992]',
            ].join(' ')}
            style={{
              padding: '14px 20px',
              fontSize: '17px',
            }}
          >
            {saindo ? (
              <>
                <LoadingSpinner size="sm" tone="ink" />
                Saindo...
              </>
            ) : (
              <>
                <LogOut size={20} strokeWidth={2} />
                Sair da conta
              </>
            )}
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
