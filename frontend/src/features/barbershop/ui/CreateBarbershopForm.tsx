import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, MapPin, Phone, Plus, X, Image as ImageIcon } from 'lucide-react'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import { ErrorMessage } from '../../../shared/ui/ErrorMessage'
import { ImageUpload } from '../../../shared/ui/ImageUpload'
import { ApiError } from '../../../shared/lib/api'
import type { Barbershop } from '../../../entities/barbershop/types'

const createBarbershopSchema = z.object({
  name: z.string().min(3, 'Nome da barbearia deve ter pelo menos 3 caracteres'),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)'),
  avatarUrl: z.string().optional().nullable(),
})

type CreateBarbershopFormData = z.infer<typeof createBarbershopSchema>

interface CreateBarbershopFormProps {
  onCreate: (dados: CreateBarbershopFormData) => Promise<Barbershop>
  onSuccess: (barbershop: Barbershop) => void
  onCancel?: () => void
  submitLabel?: string
}

export function CreateBarbershopForm({
  onCreate,
  onSuccess,
  onCancel,
  submitLabel = 'Cadastrar barbearia',
}: CreateBarbershopFormProps) {
  const tempUploadId = useMemo(() => crypto.randomUUID(), [])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateBarbershopFormData>({
    resolver: zodResolver(createBarbershopSchema),
    defaultValues: { avatarUrl: null },
  })

  async function onSubmit(dados: CreateBarbershopFormData) {
    try {
      const barbershop = await onCreate({ ...dados, avatarUrl })
      onSuccess(barbershop)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Não foi possível criar a barbearia. Tente novamente.'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <div className="md:col-span-2 space-y-4">
          <ImageUpload
            folder="barbershops"
            id={tempUploadId}
            value={avatarUrl}
            onChange={setAvatarUrl}
            label="Foto da barbearia"
            description="Mostre o ambiente e a identidade visual da sua unidade. JPG, PNG ou WEBP até 5MB."
            aspect="cover"
            size="lg"
            fileNamePrefix="capa"
          />
          <div className="flex items-start gap-2 rounded-xl bg-selected/5 border border-selected/15 p-3">
            <ImageIcon size={15} className="text-selected mt-0.5 shrink-0" />
            <p className="text-[11px] text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Dica:</strong> use uma foto bem iluminada da
              fachada, interior ou de um corte assinado. A imagem aparece na página pública da
              barbearia e nos cards de busca.
            </p>
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da barbearia"
              icon={Store}
              placeholder="Ex: Barbearia Vintage Club"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Telefone comercial"
              icon={Phone}
              placeholder="(11) 98765-4321"
              helperText="Mínimo 10 dígitos com DDD"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <Input
            label="Endereço completo"
            icon={MapPin}
            placeholder="Ex: Rua Augusta, 1200 - Consolação, São Paulo/SP"
            helperText="Inclua rua, número, bairro e cidade"
            error={errors.address?.message}
            {...register('address')}
          />
        </div>
      </div>

      {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4"
          >
            <X size={16} />
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} className="px-6 shadow-sm">
          <Plus size={16} />
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
