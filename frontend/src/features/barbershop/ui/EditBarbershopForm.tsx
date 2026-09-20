import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, MapPin, Phone, Save, Check, Image as ImageIcon } from 'lucide-react'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import { ErrorMessage } from '../../../shared/ui/ErrorMessage'
import { SuccessMessage } from '../../../shared/ui/SuccessMessage'
import { ImageUpload } from '../../../shared/ui/ImageUpload'
import { ApiError } from '../../../shared/lib/api'
import type { Barbershop } from '../../../entities/barbershop/types'

const editBarbershopSchema = z.object({
  name: z.string().min(3, 'Nome da barbearia deve ter pelo menos 3 caracteres'),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)'),
  avatarUrl: z.string().optional().nullable(),
})

type EditBarbershopFormData = z.infer<typeof editBarbershopSchema>

interface EditBarbershopFormProps {
  barbershop: Barbershop
  onUpdate: (dados: EditBarbershopFormData) => Promise<Barbershop>
}

export function EditBarbershopForm({ barbershop, onUpdate }: EditBarbershopFormProps) {
  const [sucesso, setSucesso] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(barbershop.avatarUrl ?? null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<EditBarbershopFormData>({
    resolver: zodResolver(editBarbershopSchema),
    defaultValues: {
      name: barbershop.name,
      address: barbershop.address,
      phone: barbershop.phone,
      avatarUrl: barbershop.avatarUrl ?? null,
    },
  })

  useEffect(() => {
    reset({
      name: barbershop.name,
      address: barbershop.address,
      phone: barbershop.phone,
      avatarUrl: barbershop.avatarUrl ?? null,
    })
    setAvatarUrl(barbershop.avatarUrl ?? null)
  }, [barbershop.name, barbershop.address, barbershop.phone, barbershop.avatarUrl, reset])

  const houveAlteracao = isDirty || avatarUrl !== (barbershop.avatarUrl ?? null)

  async function onSubmit(dados: EditBarbershopFormData) {
    setSucesso(false)
    try {
      await onUpdate({ ...dados, avatarUrl })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 5000)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível atualizar a barbearia. Tente novamente.'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 space-y-4">
          <ImageUpload
            folder="barbershops"
            id={barbershop.id}
            value={avatarUrl}
            onChange={setAvatarUrl}
            label="Foto da barbearia"
            description="Atualize a foto de capa da sua unidade. Ela aparece nas buscas e na página pública."
            aspect="cover"
            size="lg"
            fileNamePrefix={barbershop.name}
          />
          <div className="flex items-start gap-2 rounded-xl bg-accent/5 border border-accent/15 p-3">
            <ImageIcon size={15} className="text-accent mt-0.5 shrink-0" />
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Esta imagem é a primeira impressão do cliente. Use fotos com boa iluminação, limpeza
              e que transmitam o estilo da barbearia (fachada, interior ou ambientada).
            </p>
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              helperText="Número para contato e avisos de clientes"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <Input
            label="Endereço completo"
            icon={MapPin}
            placeholder="Ex: Rua Augusta, 1200 - Consolação, São Paulo/SP"
            helperText="Inclua rua, número, bairro e cidade para localização precisa"
            error={errors.address?.message}
            {...register('address')}
          />
        </div>
      </div>

      {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}
      {sucesso && <SuccessMessage>Dados da barbearia atualizados com sucesso!</SuccessMessage>}

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <p className="text-xs text-text-secondary">
          {houveAlteracao ? 'Há alterações não salvas' : 'Dados da unidade atualizados'}
        </p>

        <Button
          type="submit"
          loading={isSubmitting}
          className="px-6 py-2.5 shadow-sm"
        >
          {sucesso ? <Check size={18} /> : <Save size={18} />}
          {sucesso ? 'Salvo!' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
