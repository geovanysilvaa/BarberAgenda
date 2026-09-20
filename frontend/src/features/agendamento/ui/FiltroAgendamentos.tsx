import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Filter, RotateCcw, Scissors, Calendar, ListFilter } from 'lucide-react'
import { Select } from '../../../shared/ui/Select'
import { Input } from '../../../shared/ui/Input'
import { Button } from '../../../shared/ui/Button'

// RF028 — Histórico com filtros avançados (status, profissional e período).
const filtroAgendamentosSchema = z
  .object({
    status: z.enum(['todos', 'agendado', 'concluido', 'cancelado']),
    professionalId: z.string(),
    dateFrom: z.string(),
    dateTo: z.string(),
  })
  .refine((data) => !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo, {
    message: 'A data inicial não pode ser depois da data final.',
    path: ['dateTo'],
  })

export type FiltroAgendamentosValues = z.infer<typeof filtroAgendamentosSchema>

export const filtrosPadrao: FiltroAgendamentosValues = {
  status: 'todos',
  professionalId: 'todos',
  dateFrom: '',
  dateTo: '',
}

interface ProfissionalOption {
  id: string
  name: string
}

interface FiltroAgendamentosProps {
  profissionais: ProfissionalOption[]
  onChange: (valores: FiltroAgendamentosValues) => void
}

export function FiltroAgendamentos({ profissionais, onChange }: FiltroAgendamentosProps) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<FiltroAgendamentosValues>({
    resolver: zodResolver(filtroAgendamentosSchema),
    defaultValues: filtrosPadrao,
  })

  const valoresAtuais = watch()
  const temFiltroAtivo =
    valoresAtuais.status !== 'todos' ||
    valoresAtuais.professionalId !== 'todos' ||
    !!valoresAtuais.dateFrom ||
    !!valoresAtuais.dateTo

  useEffect(() => {
    const subscription = watch((valores) => {
      const resultado = filtroAgendamentosSchema.safeParse(valores)
      if (resultado.success) {
        onChangeRef.current(resultado.data)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  return (
    <div className="bg-secondary border border-border rounded-2xl p-5 mb-8 shadow-xs">
      <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-border/80">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Filter size={18} className="text-selected" />
          <span>Filtrar agendamentos</span>
          {temFiltroAtivo && (
            <span className="w-2 h-2 rounded-full bg-selected animate-pulse" title="Filtros ativos" />
          )}
        </div>

        {temFiltroAtivo && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => reset(filtrosPadrao)}
            className="text-xs px-3 py-1.5"
          >
            <RotateCcw size={14} />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select label="Status" icon={ListFilter} error={errors.status?.message} {...register('status')}>
          <option value="todos">Todos os status</option>
          <option value="agendado">Agendados</option>
          <option value="concluido">Concluídos</option>
          <option value="cancelado">Cancelados</option>
        </Select>

        <Select
          label="Profissional"
          icon={Scissors}
          error={errors.professionalId?.message}
          {...register('professionalId')}
        >
          <option value="todos">Todos os profissionais</option>
          {profissionais.map((profissional) => (
            <option key={profissional.id} value={profissional.id}>
              {profissional.name}
            </option>
          ))}
        </Select>

        <Input
          label="Data inicial"
          type="date"
          icon={Calendar}
          error={errors.dateFrom?.message}
          {...register('dateFrom')}
        />
        <Input
          label="Data final"
          type="date"
          icon={Calendar}
          error={errors.dateTo?.message}
          {...register('dateTo')}
        />
      </div>
    </div>
  )
}
