import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { RecoverPasswordForm } from '../features/auth/ui/RecoverPasswordForm'

export function RecoverPasswordPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#fef7ff]">
      <main
        className="max-w-md mx-auto px-5 pt-8 pb-10 flex flex-col gap-6"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center text-[#1a1722] hover:bg-white transition-colors"
            style={{ marginLeft: '-8px' }}
          >
            <ArrowLeft size={28} strokeWidth={2.2} />
          </button>
          <h1
            className="font-extrabold tracking-tight text-[#1a1722] leading-tight"
            style={{ fontSize: '29px', letterSpacing: '-0.02em' }}
          >
            Recuperar senha
          </h1>
        </div>

        <div className="pt-1">
          <RecoverPasswordForm />
        </div>
      </main>
    </div>
  )
}
