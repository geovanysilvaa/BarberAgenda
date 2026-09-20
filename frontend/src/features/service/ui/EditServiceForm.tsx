import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Scissors, Clock, DollarSign, FileText, Check, X, Image as ImageIcon } from 'lucide-react'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import { ErrorMessage } from '../../../shared/ui/ErrorMessage'
import { ImageUpload } from '../../../shared/ui/ImageUpload'
import { ApiError } from '../../../shared/lib/api'
import type { Service } from '../../../entities/service/types'

const editServiceSchema = z.object({
  name: z.string().min(2, 'Nome do serviço deve ter pelo menos 2 caracteres').max(150),
  description: z.string().max(500).optional(),
  durationMinutes: z
    .number({ message: 'Informe um número' })
    .int('Duração deve ser um número inteiro de minutos')
    .positive('Duração deve ser maior que zero'),
  price: z.number({ message: 'Informe um número' }).nonnegative('Preço não pode ser negativo'),
  imageUrl: z.string().optional().nullable(),
})

type EditServiceFormData = z.infer<typeof editServiceSchema>

interface EditServiceFormProps {
  service: Service
  onUpdate: (dados: EditServiceFormData) => Promise<unknown>
  onSuccess: () => void
  onCancel: () => void
}

export function EditServiceForm({ service, onUpdate, onSuccess, onCancel }: EditServiceFormProps) {
  const serviceImg = service.imageUrl || service.avatarUrl || null
  const [imageUrl, setImageUrl] = useState<string | null>(serviceImg)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<EditServiceFormData>({
    resolver: zodResolver(editServiceSchema),
    defaultValues: {
      name: service.name,
      description: service.description ?? '',
      durationMinutes: service.durationMinutes,
      price: service.price,
      imageUrl: serviceImg,
    },
  })

  useEffect(() => {
    const img = service.imageUrl || service.avatarUrl || null
    reset({
      name: service.name,
      description: service.description ?? '',
      durationMinutes: service.durationMinutes,
      price: service.price,
      imageUrl: img,
    })
    setImageUrl(img)
  }, [service.name, service.description, service.durationMinutes, service.price, service.imageUrl, service.avatarUrl, reset])

  const houveAlteracao = isDirty || imageUrl !== serviceImg

  async function onSubmit(dados: EditServiceFormData) {
    try {
      await onUpdate({ ...dados, imageUrl })
      onSuccess()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível atualizar o serviço. Tente novamente.'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2 space-y-3">
          <ImageUpload
            folder="services"
            id={service.id}
            value={imageUrl}
            onChange={setImageUrl}
            label="Foto do serviço"
            description="Atualize a foto ilustrativa do procedimento ou combo."
            aspect="square"
            size="lg"
            fileNamePrefix={service.name}
          />
          <div className="flex items-start gap-2 rounded-xl bg-selected/5 border border-selected/15 p-3">
            <ImageIcon size={14} className="text-selected mt-0.5 shrink-0" />
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Fotos atualizadas ajudam o cliente a visualizar o resultado e reduzem dúvidas antes
              do agendamento.
            </p>
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-4">
          <Input
            label="Nome do serviço"
            icon={Scissors}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Descrição"
            icon={FileText}
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Duração (minutos)"
              icon={Clock}
              type="number"
              error={errors.durationMinutes?.message}
              {...register('durationMinutes', { valueAsNumber: true })}
            />

            <Input
              label="Preço (R$)"
              icon={DollarSign}
              type="number"
              step="0.01"
              error={errors.price?.message}
              {...register('price', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-[11px] text-text-secondary">
          {houveAlteracao ? 'Alterações pendentes de salvamento' : 'Sem alterações'}
        </p>
        <div className="flex items-center gap-2">
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
      </div>
    </form>
  )
}
