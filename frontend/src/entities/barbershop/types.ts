export interface Barbershop {
  id: string
  name: string
  address: string
  phone: string
  ownerId: string
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface BusinessHours {
  id: string
  barbershopId: string
  dayOfWeek: number
  openTime: string
  closeTime: string
}
