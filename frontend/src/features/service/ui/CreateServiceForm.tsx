import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Scissors, Clock, DollarSign, FileText, Plus, Image as ImageIcon } from 'lucide-react'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import { ErrorMessage } from '../../../shared/ui/ErrorMessage'
import { ImageUpload } from '../../../shared/ui/ImageUpload'
import { ApiError } from '../../../shared/lib/api'

const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome do serviço deve ter pelo menos 2 caracteres').max(150),
  description: z.string().max(500).optional(),
  durationMinutes: z
    .number({ message: 'Informe um número' })
    .int('Duração deve ser um número inteiro de minutos')
    .positive('Duração deve ser maior que zero'),
  price: z.number({ message: 'Informe um número' }).nonnegative('Preço não pode ser negativo'),
  imageUrl: z.string().optional().nullable(),
})

type CreateServiceFormData = z.infer<typeof createServiceSchema>

interface CreateServiceFormProps {
  onCreate: (dados: CreateServiceFormData) => Promise<unknown>
  onSuccess: () => void
  onCancel?: () => void
}

export function CreateServiceForm({ onCreate, onSuccess, onCancel }: CreateServiceFormProps) {
  const tempUploadId = useMemo(() => crypto.randomUUID(), [])
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateServiceFormData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: { imageUrl: null },
  })

  async function onSubmit(dados: CreateServiceFormData) {
    try {
      await onCreate({ ...dados, imageUrl })
      onSuccess()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível cadastrar o serviço. Tente novamente.'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <div className="md:col-span-2 space-y-4">
          <ImageUpload
            folder="services"
            id={tempUploadId}
            value={imageUrl}
            onChange={setImageUrl}
            label="Foto do serviço"
            description="Exemplo do resultado: corte finalizado, barba, combo promocional etc. JPG/PNG/WEBP até 5MB."
            aspect="square"
            size="lg"
            fileNamePrefix="servico"
          />
          <div className="flex items-start gap-2 rounded-xl bg-accent/5 border border-accent/15 p-3">
            <ImageIcon size={15} className="text-accent mt-0.5 shrink-0" />
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Clientes veem esta imagem ao escolher serviços. Fotos reais dos seus trabalhos
              convertem muito mais do que imagens genéricas!
            </p>
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-4">
          <Input
            label="Nome do serviço"
            icon={Scissors}
            placeholder="Ex: Corte Masculino + Barba Terapia"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Descrição detalhada (opcional)"
            icon={FileText}
            placeholder="Ex: Inclui lavagem especial, toalha quente e finalização com pomada"
            helperText="Informações que ajudam o cliente na escolha do serviço"
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Duração aproximada (minutos)"
              icon={Clock}
              type="number"
              placeholder="Ex: 45"
              helperText="Tempo estimado para o atendimento"
              error={errors.durationMinutes?.message}
              {...register('durationMinutes', { valueAsNumber: true })}
            />

            <Input
              label="Valor do serviço (R$)"
              icon={DollarSign}
              type="number"
              step="0.01"
              placeholder="Ex: 50.00"
              helperText="Preço cobrado ao cliente"
              error={errors.price?.message}
              {...register('price', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

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
          <Plus size={18} />
          Cadastrar serviço
        </Button>
      </div>
    </form>
  )
}
