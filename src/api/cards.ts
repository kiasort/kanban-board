import { apiFetch } from './client'
import type { Card, CreateCard, UpdateCard } from '@/types'

export const cardsApi = {
  getByColumn(columnId: number): Promise<Card[]> {
    return apiFetch(`/cards?columnId=${columnId}&_sort=createdAt&_order=desc`)
  },

  getAll(): Promise<Card[]> {
    return apiFetch('/cards')
  },

  create(data: CreateCard): Promise<Card> {
    return apiFetch('/cards', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        createdAt: new Date().toISOString(),
      }),
    })
  },

  update(id: number, data: UpdateCard): Promise<Card> {
    return apiFetch(`/cards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  moveToColumn(id: number, columnId: number): Promise<Card> {
    return apiFetch(`/cards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ columnId }),
    })
  },

  delete(id: number): Promise<void> {
    return apiFetch(`/cards/${id}`, { method: 'DELETE' })
  },
}
