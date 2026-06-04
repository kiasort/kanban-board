import { apiFetch } from './client'
import type { Column } from '@/types'

export const columnsApi = {
  getByBoard(boardId: number): Promise<Column[]> {
    return apiFetch(`/columns?boardId=${boardId}&_sort=order&_order=asc`)
  },

  create(data: Omit<Column, 'id'>): Promise<Column> {
    return apiFetch('/columns', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: number, data: Partial<Column>): Promise<Column> {
    return apiFetch(`/columns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete(id: number): Promise<void> {
    return apiFetch(`/columns/${id}`, { method: 'DELETE' })
  },
}
