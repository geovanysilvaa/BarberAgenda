// src/barbershops/domain/entidades/Barbearia.ts
export interface Barbearia {
  id: string
  name: string
  address: string
  phone: string
  ownerId: string
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}

export type BarbeariaPublica = Barbearia

export function paraBarbeariaPublica(barbearia: Barbearia): BarbeariaPublica {
  return barbearia
}
