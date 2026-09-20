export type Role = 'cliente' | 'profissional' | 'owner'

export interface Usuario {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  roles: Role[]
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}
