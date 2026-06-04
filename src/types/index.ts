export interface Board {
  id: number
  title: string
  description: string
}

export interface Column {
  id: number
  boardId: number
  title: string
  order: number
}

export interface Card {
  id: number
  columnId: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

export type CreateCard = Omit<Card, 'id' | 'createdAt'>
export type UpdateCard = Partial<Pick<Card, 'columnId' | 'title' | 'description' | 'priority'>>
