export interface CriarBarbeariaDTO {
  name: string
  address: string
  phone: string
  ownerId: string
  avatarUrl?: string | null
}

export interface AtualizarBarbeariaDTO {
  name?: string
  address?: string
  phone?: string
  avatarUrl?: string | null
}

export interface BarbeariaResponseDTO {
  id: string
  name: string
  address: string
  phone: string
  ownerId: string
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}
