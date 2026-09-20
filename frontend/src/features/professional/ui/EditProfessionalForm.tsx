import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Scissors, Check, X } from 'lucide-react'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import { ErrorMessage } from '../../../shared/ui/ErrorMessage'
import { ApiError } from '../../../shared/lib/api'
import type { Professional } from '../../../entities/professional/types'

const editProfessionalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(150),
  specialty: z.string().max(100).optional(),
})

type EditProfessionalFormData = z.infer<typeof editProfessionalSchema>

interface EditProfessionalFormProps {
  professional: Professional
  onUpdate: (dados: EditProfessionalFormData) => Promise<unknown>
  onSuccess: () => void
  onCancel: () => void
}

export function EditProfessionalForm({ professional, onUpdate, onSuccess, onCancel }: EditProfessionalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<EditProfessionalFormData>({
    resolver: zodResolver(editProfessionalSchema),
    defaultValues: { name: professional.name, specialty: professional.specialty ?? '' },
  })

  async function onSubmit(dados: EditProfessionalFormData) {
    try {
      await onUpdate(dados)
      onSuccess()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível atualizar. Tente novamente.'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Nome completo"
        icon={User}
        placeholder="Nome do profissional"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Especialidade"
        icon={Scissors}
        placeholder="Ex: Cortes e Barba"
        error={errors.specialty?.message}
        {...register('specialty')}
      />

      {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-3.5 py-1.5 text-xs"
        >
          <X size={14} />
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          loading={isSubmitting}
          className="px-4 py-1.5 text-xs shadow-2xs"
        >
          <Check size={14} />
          Salvar
        </Button>
      </div>
    </form>
  )
}
