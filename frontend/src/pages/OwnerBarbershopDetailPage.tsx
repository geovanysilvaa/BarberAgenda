import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Store,
  ShieldAlert,
  MoreVertical,
  Camera,
  Check,
  Building2,
  Users,
  Scissors,
  Clock,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../features/auth/model/useAuth'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useActiveBarbershop } from '../features/barbershop/model/ActiveBarbershopContext'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { SuccessMessage } from '../shared/ui/SuccessMessage'
import { BottomNav } from '../shared/ui/BottomNav'
import {
  ImageUploadHidden,
  type ImageUploadHiddenHandle,
} from '../shared/ui/ImageUploadHidden'
import { ApiError } from '../shared/lib/api'
import type { Barbershop } from '../entities/barbershop/types'

// ============================================================================
// Schema: endereço decomposto em telas separadas (design), mas unificado
// em `address` único no submit para manter compatibilidade com a API.
// ============================================================================
const editarBarbeariaSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(120),
  phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)').max(20),
  cep: z.string().max(12).optional().or(z.literal('')),
  rua: z.string().max(150).optional().or(z.literal('')),
  numero: z.string().max(20).optional().or(z.literal('')),
  complemento: z.string().max(80).optional().or(z.literal('')),
  bairro: z.string().max(100).optional().or(z.literal('')),
  cidade: z.string().max(100).optional().or(z.literal('')),
  estado: z.string().max(4).optional().or(z.literal('')),
})

type EditarBarbeariaFormData = z.infer<typeof editarBarbeariaSchema>

/**
 * Desmonta um address único (string da API) em componentes para exibição
 * no design. Não é 100% preciso (o DB só salva a string concatenada), então
 * usa heurísticas simples e deixa campos vazios caso não consiga parsear.
 */
function decomporEndereco(address: string): Omit<EditarBarbeariaFormData, 'name' | 'phone'> {
  const partes = {
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  }

  if (!address.trim()) return partes

  const upper = address.trim()

  // ====== Tenta extrair Estado (2 letras no final, ex: " - SP" ou "/SP") ======
  let resto = upper
  const matchEstado = resto.match(/[-/]\s*([A-Z]{2})\s*$/)
  if (matchEstado) {
    partes.estado = matchEstado[1]
    resto = resto.slice(0, resto.length - matchEstado[0].length).trim()
  }

  // ====== Cidade (antes do estado e após último "-" ou ",") ======
  const matchCidade = resto.match(/[,–-]\s*([^,–-]+)\s*$/)
  if (matchCidade) {
    partes.cidade = matchCidade[1].trim()
    resto = resto.slice(0, resto.length - matchCidade[0].length).trim()
  }

  // ====== Bairro (antes da cidade, separado por " - ") ======
  const matchBairro = resto.match(/[-]\s*([^,-]+)\s*$/)
  if (matchBairro) {
    partes.bairro = matchBairro[1].trim()
    resto = resto.slice(0, resto.length - matchBairro[0].length).trim()
  }

  // ====== Rua + Número ======
  // Tenta achar o número (sequência de dígitos + optional letra) na parte final do que sobrou
  const matchNumero = resto.match(/[,]?\s*(\d[\w]*)[,\s]*?$/)
  if (matchNumero) {
    partes.numero = matchNumero[1].trim()
    partes.rua = resto.slice(0, resto.length - matchNumero[0].length).replace(/[,]\s*$/, '').trim()
  } else {
    partes.rua = resto
  }

  return partes
}

/**
 * Monta o address único a partir dos campos separados do form.
 */
function montarAddress(d: EditarBarbeariaFormData): string {
  const partes: string[] = []
  if (d.rua) {
    const rua = d.rua.trim()
    if (d.numero) partes.push(`${rua}, ${d.numero.trim()}`)
    else partes.push(rua)
  } else if (d.numero) {
    partes.push(d.numero.trim())
  }
  if (d.complemento?.trim()) partes.push(d.complemento.trim())
  if (d.bairro?.trim()) partes.push(d.bairro.trim())
  if (d.cidade?.trim()) {
    const uf = d.estado?.trim().toUpperCase()
    partes.push(uf ? `${d.cidade.trim()}/${uf}` : d.cidade.trim())
  } else if (d.estado?.trim()) {
    partes.push(d.estado.trim().toUpperCase())
  }
  if (d.cep?.trim()) {
    // Adiciona CEP apenas se estiver preenchido, silenciosamente
    const apenasNumeros = d.cep.trim().replace(/\D/g, '')
    if (apenasNumeros.length === 8) {
      partes.push(
        `CEP ${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5)}`,
      )
    } else {
      partes.push(`CEP ${d.cep.trim()}`)
    }
  }
  return partes.join(' - ')
}

export function OwnerBarbershopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { barbearia, loading, error, buscarBarbearia, atualizarBarbearia } = useBarbeiro()
  const { selecionarBarbearia } = useActiveBarbershop()
  const avatarHiddenRef = useRef<ImageUploadHiddenHandle | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [mostrarMenu, setMostrarMenu] = useState(false)

  useEffect(() => {
    if (id) {
      buscarBarbearia(id)
      selecionarBarbearia(id)
    }
  }, [id, buscarBarbearia, selecionarBarbearia])

  const ehDono = !!barbearia && !!user && barbearia.ownerId === user.id

  const dadosIniciais = (b: Barbershop): EditarBarbeariaFormData => {
    const decomposto = decomporEndereco(b.address)
    return {
      name: b.name,
      phone: b.phone,
      ...decomposto,
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<EditarBarbeariaFormData>({
    resolver: zodResolver(editarBarbeariaSchema),
    defaultValues: barbearia ? dadosIniciais(barbearia) : {
      name: '', phone: '', cep: '', rua: '', numero: '',
      complemento: '', bairro: '', cidade: '', estado: '',
    },
  })

  useEffect(() => {
    if (barbearia) {
      reset(dadosIniciais(barbearia))
      setAvatarUrl(barbearia.avatarUrl ?? null)
    }
  }, [barbearia])

  const houveAlteracao =
    isDirty || avatarUrl !== (barbearia?.avatarUrl ?? null)

  const watchedPhone = watch('phone')
  const watchedCep = watch('cep')
  const watchedEstado = watch('estado')

  async function onSubmit(dados: EditarBarbeariaFormData) {
    if (!id || !barbearia) return
    setSucesso(null)
    try {
      const address = montarAddress(dados)
      await atualizarBarbearia(id, {
        name: dados.name.trim(),
        phone: dados.phone,
        address,
        avatarUrl,
      })
      setSucesso('Dados da barbearia atualizados com sucesso!')
      setTimeout(() => setSucesso(null), 4500)
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'Não foi possível atualizar a barbearia. Tente novamente.'
      setError('root', { message })
    }
  }

  // ===== Render helpers =====

  if (loading && !barbearia) {
    return (
      <div className="min-h-screen bg-[#fef7ff] pb-40 md:pb-8">
        <div className="max-w-md mx-auto px-5 py-20 flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" tone="selected" />
          <p className="text-sm text-[#6b6478]">Carregando dados da barbearia...</p>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fef7ff] pb-28 md:pb-8">
      <main className="max-w-md mx-auto px-5 pt-6 pb-4 flex flex-col gap-6 md:max-w-5xl md:px-6 md:pt-8">
        {/* ===================== HEADER INLINE ===================== */}
        <div className="flex items-center justify-between gap-3 relative">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#2b2238] hover:bg-[#efe8ff] transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={26} strokeWidth={1.9} />
          </button>

          <h1
            className="flex-1 text-center font-extrabold tracking-tight text-[#1a1722] pr-14"
            style={{ fontSize: '28px', letterSpacing: '-0.015em' }}
          >
            Editar Barbearia
          </h1>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMostrarMenu((v) => !v)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#2b2238] hover:bg-[#efe8ff] transition-colors"
              aria-label="Mais opções"
            >
              <MoreVertical size={24} strokeWidth={2} />
            </button>
            {mostrarMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMostrarMenu(false)}
                />
                <div
                  className="absolute right-0 top-11 z-20 bg-white rounded-[18px] border border-[#ebe7f5] shadow-[0_10px_30px_-10px_rgba(26,24,58,0.25)] overflow-hidden min-w-[200px]"
                >
                  <Link
                    to={`/barbershops/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMostrarMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-[15px] font-semibold text-[#2b2238] hover:bg-[#faf7ff] transition-colors"
                  >
                    <Store size={17} strokeWidth={2} className="text-[#6d5bd9]" />
                    Ver página pública
                  </Link>
                  <Link
                    to="/owner/barbershops"
                    onClick={() => setMostrarMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-[15px] font-semibold text-[#2b2238] hover:bg-[#faf7ff] transition-colors border-t border-[#f2edfa]"
                  >
                    <Store size={17} strokeWidth={2} className="text-[#6d5bd9]" />
                    Minhas Barbearias
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===================== SUB-MENU HORIZONTAL (ABAS) ===================== */}
        {barbearia && ehDono && (
          <div
            className="flex items-center gap-2 overflow-x-auto -mx-5 px-5 pt-1"
            style={{ scrollbarWidth: 'none' }}
          >
            <style>{`
              /* Hide scrollbar (Chrome/Safari/Edge) */
              .flex::-webkit-scrollbar { display: none; }
            `}</style>
            <AbaLink
              to={`/owner/barbershops/${id}`}
              atual={/\/owner\/barbershops\/[^/]+\/?$/.test(location.pathname)}
              icon={<Building2 size={16} strokeWidth={2.1} />}
              label="Dados Gerais"
            />
            <AbaLink
              to={`/owner/barbershops/${id}/professionals`}
              atual={location.pathname.includes('/professionals')}
              icon={<Users size={16} strokeWidth={2.1} />}
              label="Profissionais"
            />
            <AbaLink
              to={`/owner/barbershops/${id}/services`}
              atual={location.pathname.includes('/services')}
              icon={<Scissors size={16} strokeWidth={2.1} />}
              label="Serviços"
            />
            <AbaLink
              to={`/owner/barbershops/${id}/hours`}
              atual={location.pathname.includes('/hours')}
              icon={<Clock size={16} strokeWidth={2.1} />}
              label="Horários"
            />
          </div>
        )}

        {/* ===================== ERRO GERAL ===================== */}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {/* ===================== ACESSO NEGADO ===================== */}
        {barbearia && !ehDono && (
          <div className="bg-[#fde5e5]/50 border border-[#f3c9c9] rounded-[22px] p-6 flex items-start gap-4">
            <ShieldAlert size={24} className="text-[#c94e4e] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[17px] font-extrabold text-[#2b2238]">
                Acesso Restrito
              </h3>
              <p className="text-[14px] text-[#6b6478] leading-relaxed">
                Você não possui permissão de proprietário para gerenciar esta barbearia.
              </p>
            </div>
          </div>
        )}

        {/* ===================== FORMULÁRIO ===================== */}
        {barbearia && ehDono && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            noValidate
          >
            {/* AVATAR CIRCULAR 140px + upload headless via ref */}
            <ImageUploadHidden
              ref={avatarHiddenRef}
              folder="barbershops"
              id={barbearia.id}
              value={avatarUrl}
              onChange={setAvatarUrl}
              fileNamePrefix={barbearia.name}
            />

            <div className="flex flex-col items-center justify-center pt-1 pb-2">
              <button
                type="button"
                onClick={() => avatarHiddenRef.current?.trigger()}
                className="relative block group focus:outline-none focus-visible:ring-4 focus-visible:ring-[#6d5bd9]/20 rounded-full"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`Avatar ${barbearia.name}`}
                    className="w-[140px] h-[140px] rounded-full object-cover border-4 transition-opacity group-hover:opacity-95"
                    style={{ borderColor: '#efe8ff' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div
                    className="w-[140px] h-[140px] rounded-full flex items-center justify-center border-4 group-hover:opacity-90 transition-opacity"
                    style={{
                      borderColor: '#efe8ff',
                      background:
                        'linear-gradient(135deg, #efe8ff 0%, #e4dcff 100%)',
                    }}
                  >
                    <Store size={52} strokeWidth={1.75} className="text-[#6d5bd9]/70" />
                  </div>
                )}
                <div
                  className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full flex items-center justify-center shadow-md text-white border-4 border-[#fef7ff]"
                  style={{ backgroundColor: '#6d5bd9' }}
                >
                  <Camera size={18} strokeWidth={2.2} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => avatarHiddenRef.current?.trigger()}
                className="mt-3 text-[14px] font-bold text-[#6d5bd9] hover:text-[#5d4bc9] transition-colors"
              >
                {avatarUrl ? 'Alterar foto' : 'Adicionar foto'}
              </button>
            </div>

            {/* NOME */}
            <CampoInput
              label="Nome da barbearia"
              placeholder="Ex: Vintage Cut Club"
              value={watch('name') ?? ''}
              error={errors.name?.message}
              inputProps={register('name')}
            />

            {/* TELEFONE COM MASCARA */}
            <CampoInput
              label="Telefone comercial"
              placeholder="(11) 98765-4321"
              value={watchedPhone ?? ''}
              error={errors.phone?.message}
              inputProps={{
                type: 'tel',
                inputMode: 'tel',
                autoComplete: 'tel',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 11)
                  if (v.length >= 7) {
                    v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
                  } else if (v.length >= 2) {
                    v = `(${v.slice(0, 2)}) ${v.slice(2)}`
                  }
                  e.target.value = v
                  register('phone').onChange(e)
                },
                onBlur: register('phone').onBlur,
                name: 'phone',
                ref: register('phone').ref,
              }}
            />

            {/* CEP COM MASCARA */}
            <CampoInput
              label="CEP"
              placeholder="01311-000"
              value={watchedCep ?? ''}
              error={errors.cep?.message}
              inputProps={{
                type: 'text',
                inputMode: 'numeric',
                autoComplete: 'postal-code',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 8)
                  if (v.length >= 6) {
                    v = `${v.slice(0, 5)}-${v.slice(5)}`
                  }
                  e.target.value = v
                  register('cep').onChange(e)
                },
                onBlur: register('cep').onBlur,
                name: 'cep',
                ref: register('cep').ref,
              }}
            />

            {/* RUA */}
            <CampoInput
              label="Rua"
              placeholder="Av. Paulista"
              value={watch('rua') ?? ''}
              error={errors.rua?.message}
              inputProps={register('rua')}
            />

            {/* NÚMERO */}
            <CampoInput
              label="Número"
              placeholder="1000"
              value={watch('numero') ?? ''}
              error={errors.numero?.message}
              inputProps={register('numero')}
            />

            {/* COMPLEMENTO */}
            <CampoInput
              label="Complemento"
              placeholder="Sala 402"
              value={watch('complemento') ?? ''}
              error={errors.complemento?.message}
              inputProps={register('complemento')}
            />

            {/* BAIRRO */}
            <CampoInput
              label="Bairro"
              placeholder="Bela Vista"
              value={watch('bairro') ?? ''}
              error={errors.bairro?.message}
              inputProps={register('bairro')}
            />

            {/* CIDADE + ESTADO (GRID 2 COLUNAS) */}
            <div className="grid grid-cols-2 gap-4">
              <CampoInput
                label="Cidade"
                placeholder="São Paulo"
                value={watch('cidade') ?? ''}
                error={errors.cidade?.message}
                inputProps={register('cidade')}
              />
              <CampoInput
                label="Estado"
                placeholder="SP"
                value={watchedEstado ?? ''}
                error={errors.estado?.message}
                inputProps={{
                  type: 'text',
                  autoComplete: 'address-level1',
                  maxLength: 2,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value
                      .replace(/[^a-zA-Z]/g, '')
                      .toUpperCase()
                      .slice(0, 2)
                    register('estado').onChange(e)
                  },
                  onBlur: register('estado').onBlur,
                  name: 'estado',
                  ref: register('estado').ref,
                }}
              />
            </div>

            {/* FEEDBACKS */}
            {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}
            {sucesso && <SuccessMessage>{sucesso}</SuccessMessage>}

            {/* BOTÃO SALVAR ALTERAÇÕES */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !houveAlteracao}
                className={[
                  'w-full inline-flex items-center justify-center gap-2',
                  'text-white font-extrabold tracking-tight transition-all duration-150',
                  'rounded-[999px]',
                  houveAlteracao && !isSubmitting
                    ? 'bg-[#6d5bd9] hover:bg-[#5d4bc9] shadow-[0_10px_26px_-8px_rgba(109,91,217,0.55)] active:scale-[0.992]'
                    : 'bg-[#b9b0d4] cursor-not-allowed shadow-none',
                ].join(' ')}
                style={{ padding: '17px 24px', fontSize: '18px' }}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" tone="white" />
                    Salvando...
                  </>
                ) : sucesso ? (
                  <>
                    <Check size={20} strokeWidth={2.4} />
                    Salvo!
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  )
}

// ============================================================================
// Componentes auxiliares
// ============================================================================

interface CampoInputProps {
  label: string
  placeholder: string
  value: string
  error?: string
  inputProps: React.InputHTMLAttributes<HTMLInputElement> & {
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    name?: string
    ref?: React.Ref<HTMLInputElement>
  }
}

function CampoInput({ label, placeholder, value, error, inputProps }: CampoInputProps) {
  const { ref, ...rest } = inputProps
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="font-semibold tracking-tight"
        style={{ color: '#6d5bd9', fontSize: '15px' }}
      >
        {label}
      </label>
      <input
        {...rest}
        ref={ref as React.Ref<HTMLInputElement>}
        value={value}
        type={inputProps.type ?? 'text'}
        placeholder={placeholder}
        className={[
          'w-full bg-white border rounded-[14px]',
          'font-bold tracking-tight text-[#1a1722]',
          'placeholder:text-[#b7b0ca]',
          'transition-all duration-150 outline-none',
          error
            ? 'border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
            : 'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
        ].join(' ')}
        style={{ padding: '13px 18px', fontSize: '19px' }}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-[13px] font-semibold text-red-600 pl-1">{error}</p>
      )}
    </div>
  )
}

interface AbaLinkProps {
  to: string
  atual: boolean
  icon: React.ReactNode
  label: string
}

function AbaLink({ to, atual, icon, label }: AbaLinkProps) {
  return (
    <Link
      to={to}
      className={[
        'shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full',
        'text-[14px] font-extrabold tracking-tight whitespace-nowrap',
        'transition-all duration-150',
        atual
          ? 'bg-white text-[#6d5bd9] shadow-[0_1px_2px_rgba(18,17,51,0.04),0_6px_14px_-6px_rgba(109,91,217,0.35)]'
          : 'bg-transparent text-[#837c92] hover:text-[#6d5bd9]',
      ].join(' ')}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export { AbaLink }
