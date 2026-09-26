export type AppointmentStatus = 'agendado' | 'concluido' | 'cancelado'

export interface Appointment {
  id: string
  status: AppointmentStatus
  professional: { id: string; name: string }
  service: { id: string; name: string; duration: number }
  barbershop?: { id: string; name: string }
  barbershopId?: string
  date: string
  startTime: string
  endTime: string
  createdAt: string
}

export interface RawAppointment {
  id: string
  clientId: string
  professionalId: string
  serviceId: string
  barbershopId: string
  date: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  createdAt: string
  updatedAt: string
}

export interface Unavailability {
  id: string
  professionalId: string
  startsAt: string
  endsAt: string
  reason: string | null
  createdAt: string
}

export interface RecurringUnavailability {
  id: string
  professionalId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  reason: string | null
  createdAt: string
}

export interface MeuProfissional {
  id: string
  barbershopId: string
  specialty: string | null
}
