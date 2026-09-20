import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Phone, Mail, Save, Check } from 'lucide-react'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'
import { ErrorMessage } from '../../../shared/ui/ErrorMessage'
import { SuccessMessage } from '../../../shared/ui/SuccessMessage'
import { ApiError } from '../../../shared/lib/api'
import type { Usuario } from '../../../entities/usuario/types'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(150),
  phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)').max(20),
})

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

interface UpdateProfileFormProps {
  user: Usuario
  onUpdate: (dados: UpdateProfileFormData) => Promise<unknown>
}

export function UpdateProfileForm({ user, onUpdate }: UpdateProfileFormProps) {
  const [sucesso, setSucesso] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name, phone: user.phone },
  })

  // Sincroniza os valores quando o usuário for atualizado externamente
  useEffect(() => {
    reset({ name: user.name, phone: user.phone })
  }, [user.name, user.phone, reset])

  async function onSubmit(dados: UpdateProfileFormData) {
    setSucesso(false)
    try {
      await onUpdate(dados)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 5000)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível atualizar. Tente novamente.'
      setError('root', { message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Nome completo"
          icon={User}
          placeholder="Ex: João da Silva"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Telefone celular"
          icon={Phone}
          placeholder="(11) 98765-4321"
          helperText="Usado para notificações e contato"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <Input
        label="E-mail de acesso"
        icon={Mail}
        value={user.email}
        disabled
        helperText="O e-mail é vinculado à sua autenticação e não pode ser modificado aqui."
      />

      {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}
      {sucesso && <SuccessMessage>Suas informações foram atualizadas com sucesso!</SuccessMessage>}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-xs text-text-secondary">
          {isDirty ? 'Alterações não salvas' : 'Dados sincronizados'}
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
