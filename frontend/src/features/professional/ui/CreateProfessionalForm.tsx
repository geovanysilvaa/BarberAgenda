import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, Lock, Scissors, UserPlus } from 'lucide-react'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import { ErrorMessage } from '../../../shared/ui/ErrorMessage'
import { ApiError } from '../../../shared/lib/api'

const createProfessionalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(150),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)').max(20),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  specialty: z.string().max(100).optional(),
})

type CreateProfessionalFormData = z.infer<typeof createProfessionalSchema>

interface CreateProfessionalFormProps {
  onCreate: (dados: CreateProfessionalFormData) => Promise<unknown>
  onSuccess: () => void
  onCancel?: () => void
}

export function CreateProfessionalForm({ onCreate, onSuccess, onCancel }: CreateProfessionalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateProfessionalFormData>({ resolver: zodResolver(createProfessionalSchema) })

  async function onSubmit(dados: CreateProfessionalFormData) {
    try {
      await onCreate(dados)
      onSuccess()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível cadastrar o profissional. Tente novamente.'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nome completo"
          icon={User}
          placeholder="Ex: Carlos Eduardo"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Telefone celular"
          icon={Phone}
          placeholder="(11) 98765-4321"
          helperText="WhatsApp para contato de clientes"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="E-mail de acesso"
          type="email"
          icon={Mail}
          placeholder="profissional@email.com"
          helperText="Login de acesso do profissional"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha de acesso"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          helperText="Mínimo de 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <Input
        label="Especialidade (opcional)"
        icon={Scissors}
        placeholder="Ex: Barba clássica, Cortes modernos, Pigmentação..."
        helperText="Destaque as principais técnicas do profissional"
        error={errors.specialty?.message}
        {...register('specialty')}
      />

      {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-5 py-2.5 text-sm"
          >
            Cancelar
          </Button>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
          className="px-6 py-2.5 text-sm shadow-sm"
        >
          <UserPlus size={18} />
          Cadastrar profissional
        </Button>
      </div>
    </form>
  )
}
