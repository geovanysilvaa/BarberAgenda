export interface CadastrarServicoDTO {
  name: string
  description?: string
  durationMinutes: number
  price: number
  barbershopId: string
  ownerId: string
  imageUrl?: string | null
  avatarUrl?: string | null
}

export interface AtualizarServicoDTO {
  name?: string
  description?: string
  durationMinutes?: number
  price?: number
  barbershopId: string
  imageUrl?: string | null
  avatarUrl?: string | null
}

export interface ServicoResponseDTO {
  id: string
  barbershopId: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
  imageUrl?: string | null
  avatarUrl?: string | null
  createdAt: string
}
