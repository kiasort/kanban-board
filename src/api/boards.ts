import { apiFetch } from './client'
import type { Board } from '@/types'

export const boardsApi = {
  getAll(): Promise<Board[]> {
    return apiFetch('/boards')
  },

  getById(id: number): Promise<Board> {
    return apiFetch(`/boards/${id}`)
  },

  create(data: Omit<Board, 'id'>): Promise<Board> {
    return apiFetch('/boards', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: number, data: Partial<Board>): Promise<Board> {
    return apiFetch(`/boards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete(id: number): Promise<void> {
    return apiFetch(`/boards/${id}`, { method: 'DELETE' })
  },
}
