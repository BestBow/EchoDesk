export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER'
export type FormStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
export type QuestionType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'SINGLE_CHOICE'
  | 'MULTI_CHOICE'
  | 'RATING'
  | 'NPS'
  | 'DATE'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  logoUrl?: string
  members?: WorkspaceMember[]
  _count?: { forms: number; members: number }
}

export interface WorkspaceMember {
  user: User
  role: Role
  joinedAt: string
}

export interface Question {
  id: string
  title: string
  description?: string
  type: QuestionType
  required: boolean
  order: number
  options?: string[]
}

export interface Form {
  id: string
  title: string
  description?: string
  status: FormStatus
  isAnonymous: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  questions: Question[]
  createdBy?: Pick<User, 'id' | 'name' | 'avatarUrl'>
  _count?: { responses: number }
}
