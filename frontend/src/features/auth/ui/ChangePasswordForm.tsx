import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, KeyRound, Check } from 'lucide-react'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import { ErrorMessage } from '../../../shared/ui/ErrorMessage'
import { SuccessMessage } from '../../../shared/ui/SuccessMessage'
import { ApiError } from '../../../shared/lib/api'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe sua senha atual'),
  newPassword: z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres'),
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

interface ChangePasswordFormProps {
  onUpdate: (dados: ChangePasswordFormData) => Promise<unknown>
}

export function ChangePasswordForm({ onUpdate }: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
  } = useForm<ChangePasswordFormData>({ resolver: zodResolver(changePasswordSchema) })

  async function onSubmit(dados: ChangePasswordFormData) {
    try {
      await onUpdate(dados)
      reset()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível trocar a senha. Verifique a senha atual e tente novamente.'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Senha atual"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />

        <Input
          label="Nova senha"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          helperText="Mínimo de 8 caracteres com letras e números"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
      </div>

      {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}
      {isSubmitSuccessful && !errors.root && (
        <SuccessMessage>Sua senha foi alterada com sucesso!</SuccessMessage>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-xs text-text-secondary">
          Nunca informe sua senha a outras pessoas
        </p>
        <Button type="submit" loading={isSubmitting} className="px-6 py-2.5 shadow-sm">
          {isSubmitSuccessful && !errors.root ? <Check size={18} /> : <KeyRound size={18} />}
          Atualizar senha
        </Button>
      </div>
    </form>
  )
}
