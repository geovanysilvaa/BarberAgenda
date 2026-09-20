import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  ShieldCheck,
  Settings,
  Crown,
  Scissors,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Copy,
  Check,
  AlertTriangle,
  Trash2,
  Lock,
  BadgeCheck,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../features/auth/model/useAuth'
import { UpdateProfileForm } from '../features/auth/ui/UpdateProfileForm'
import { ChangePasswordForm } from '../features/auth/ui/ChangePasswordForm'
import { Card } from '../shared/ui/Card'
import { Button } from '../shared/ui/Button'
import { Avatar } from '../shared/ui/Avatar'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { ApiError } from '../shared/lib/api'
import type { Role } from '../entities/usuario/types'

type ActiveTab = 'dados' | 'seguranca' | 'conta'

const ROLE_INFO: Record<Role, { label: string; icon: typeof User; color: string }> = {
  owner: {
    label: 'Proprietário',
    icon: Crown,
    color: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  },
  profissional: {
    label: 'Profissional',
    icon: Scissors,
    color: 'bg-selected/10 text-selected border-selected/30',
  },
  cliente: {
    label: 'Cliente',
    icon: UserCheck,
    color: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  },
}

export function ProfilePage() {
  const { user, atualizarUsuario, excluirConta } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ActiveTab>('dados')
  const [excluindo, setExcluindo] = useState(false)
  const [excluirErro, setExcluirErro] = useState<string | null>(null)
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [copiadoId, setCopiadoId] = useState(false)

  if (!user) return null

  function copiarId() {
    if (!user) return
    navigator.clipboard.writeText(user.id)
    setCopiadoId(true)
    setTimeout(() => setCopiadoId(false), 2000)
  }

  async function handleConfirmarExcluir() {
    setExcluindo(true)
    setExcluirErro(null)
    try {
      await excluirConta()
      navigate('/')
    } catch (err) {
      setExcluirErro(err instanceof ApiError ? err.message : 'Não foi possível excluir sua conta. Tente novamente.')
      setExcluindo(false)
      setModalExcluirAberto(false)
    }
  }

  const dataFormatada = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : 'data recente'

  const dataCompleta = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

  return (
    <div className="min-h-screen bg-primary">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-12 flex flex-col gap-8">
        {/* Banner e Hero Header do Perfil */}
        <div className="bg-secondary border border-border rounded-2xl overflow-hidden shadow-sm shadow-black/[0.04]">
          {/* Banner de topo com textura/gradiente escuro clássico de barbearia */}
          <div className="h-28 sm:h-36 bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950 relative flex items-start justify-end p-4 sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(79,70,229,0.2),transparent_70%)] pointer-events-none" />
            <span className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Conta Ativa
            </span>
          </div>

          {/* Dados e Identidade do Usuário */}
          <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              {/* Somente o avatar recebe margem negativa para sobrepor o banner sem arrastar o nome */}
              <div className="-mt-14 sm:-mt-16 shrink-0 relative z-10">
                <Avatar
                  name={user.name}
                  size="xl"
                  className="ring-4 ring-white shadow-xl bg-gradient-to-br from-dark to-indigo-950"
                />
              </div>

              {/* Nome e badges ficam perfeitamente posicionados na área de conteúdo claro */}
              <div className="flex-1 min-w-0 pt-1 sm:pt-0 sm:pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight truncate">
                  {user.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {user.roles.map((role) => {
                    const info = ROLE_INFO[role] || {
                      label: role,
                      icon: User,
                      color: 'bg-zinc-100 text-zinc-700 border-zinc-200',
                    }
                    const RoleIcon = info.icon
                    return (
                      <span
                        key={role}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-xs ${info.color}`}
                      >
                        <RoleIcon size={14} strokeWidth={2} />
                        {info.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Metadados rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/80">
              <div className="flex items-center gap-2 text-sm text-text-secondary bg-white p-3 rounded-xl border border-border">
                <Mail size={16} className="text-text-secondary shrink-0" />
                <span className="truncate" title={user.email}>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary bg-white p-3 rounded-xl border border-border">
                <Phone size={16} className="text-text-secondary shrink-0" />
                <span>{user.phone || 'Sem telefone'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary bg-white p-3 rounded-xl border border-border">
                <Calendar size={16} className="text-text-secondary shrink-0" />
                <span className="capitalize">Desde {dataFormatada}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dados'
                ? 'border-selected text-selected font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
            }`}
          >
            <User size={18} />
            Informações Pessoais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seguranca')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'seguranca'
                ? 'border-selected text-selected font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
            }`}
          >
            <ShieldCheck size={18} />
            Segurança & Senha
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('conta')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'conta'
                ? 'border-selected text-selected font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
            }`}
          >
            <Settings size={18} />
            Conta & Preferências
          </button>
        </div>

        {/* Conteúdo da Aba 1: Dados Pessoais */}
        {activeTab === 'dados' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <Card className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                    <User size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">Editar Informações</h2>
                    <p className="text-sm text-text-secondary">
                      Atualize seus dados para manter seus agendamentos e contatos sincronizados.
                    </p>
                  </div>
                </div>

                <UpdateProfileForm user={user} onUpdate={atualizarUsuario} />
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5 text-text-primary font-semibold text-sm">
                  <BadgeCheck size={18} className="text-selected shrink-0" />
                  Privacidade dos Dados
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Seu nome e telefone são compartilhados exclusivamente com as barbearias e profissionais onde você realiza agendamentos.
                </p>
                <div className="pt-3 border-t border-border flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 size={14} className="text-success shrink-0" />
                    Confirmações e lembretes de corte
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 size={14} className="text-success shrink-0" />
                    Contato direto pelo WhatsApp
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 2: Segurança */}
        {activeTab === 'seguranca' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <Card className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                    <Lock size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">Trocar Senha</h2>
                    <p className="text-sm text-text-secondary">
                      Para sua segurança, escolha uma senha forte com letras e números.
                    </p>
                  </div>
                </div>

                <ChangePasswordForm onUpdate={atualizarUsuario} />
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5 text-text-primary font-semibold text-sm">
                  <ShieldCheck size={18} className="text-selected shrink-0" />
                  Dicas de Segurança
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Proteja sempre suas credenciais para evitar acessos indevidos aos seus agendamentos e barbearias.
                </p>
                <ul className="text-xs text-text-secondary flex flex-col gap-2 list-disc list-inside">
                  <li>Use pelo menos 8 caracteres</li>
                  <li>Evite datas de nascimento ou senhas óbvias</li>
                  <li>Nunca compartilhe seus dados de acesso</li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 3: Conta & Preferências */}
        {activeTab === 'conta' && (
          <div className="flex flex-col gap-8">
            {/* Informações detalhadas do sistema */}
            <Card className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                  <Settings size={20} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Detalhes da Conta</h2>
                  <p className="text-sm text-text-secondary">
                    Identificadores e informações técnicas do seu registro.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-border flex flex-col gap-1">
                  <span className="text-xs text-text-secondary font-medium">Identificador Único (ID)</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-text-primary truncate">{user.id}</span>
                    <button
                      type="button"
                      onClick={copiarId}
                      className="p-1.5 hover:bg-secondary rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      title="Copiar ID"
                    >
                      {copiadoId ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-border flex flex-col gap-1">
                  <span className="text-xs text-text-secondary font-medium">Data de Cadastro</span>
                  <span className="text-sm font-medium text-text-primary">{dataCompleta}</span>
                </div>
              </div>
            </Card>

            {/* Zona de Perigo */}
            <div className="border border-red-200 bg-red-50/30 rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-red-900">Zona de Perigo — Exclusão de Conta</h3>
                  <p className="text-sm text-red-700/90 leading-relaxed">
                    Ao excluir sua conta, todos os seus dados pessoais, histórico e vínculos de agendamentos serão permanentemente removidos. Esta ação não poderá ser desfeita.
                  </p>
                </div>
              </div>

              {excluirErro && <ErrorMessage>{excluirErro}</ErrorMessage>}

              <div className="pt-3 border-t border-red-200 flex justify-end">
                <Button
                  variant="danger"
                  onClick={() => setModalExcluirAberto(true)}
                  className="w-full sm:w-auto px-6 py-2.5 justify-center"
                >
                  <Trash2 size={18} />
                  Excluir minha conta
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Elegante de Confirmação de Exclusão */}
        {modalExcluirAberto && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Confirmar Exclusão</h3>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed">
                Você tem certeza absoluta de que deseja excluir sua conta? Esta ação é definitiva e apagará todos os seus registros no Barber Agenda.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  disabled={excluindo}
                  onClick={() => setModalExcluirAberto(false)}
                  className="px-4 py-2 border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  loading={excluindo}
                  onClick={handleConfirmarExcluir}
                  className="px-5 py-2"
                >
                  Confirmar e Excluir
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
