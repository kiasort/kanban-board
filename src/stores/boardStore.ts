import { defineStore } from 'pinia'
import { ref } from 'vue'
import { boardsApi } from '@/api/boards'
import { columnsApi } from '@/api/columns'
import { cardsApi } from '@/api/cards'
import type { Board, Column, Card, CreateCard } from '@/types'

export const useBoardStore = defineStore('board', () => {
  const boards = ref<Board[]>([])
  const columns = ref<Column[]>([])
  const cards = ref<Card[]>([])
  const loading = ref(false)
  const error = ref('')

  // Загрузить все доски
  async function fetchBoards() {
    loading.value = true
    error.value = ''
    try {
      boards.value = await boardsApi.getAll()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки досок'
    } finally {
      loading.value = false
    }
  }

  // Загрузить колонки и карточки для конкретной доски
  async function fetchBoardData(boardId: number) {
    loading.value = true
    error.value = ''
    try {
      const [cols, allCards] = await Promise.all([
        columnsApi.getByBoard(boardId),
        cardsApi.getAll(),
      ])
      columns.value = cols
      // Фильтруем карточки — оставляем только те, что принадлежат колонкам этой доски
      const columnIds = cols.map((c) => c.id)
      cards.value = allCards.filter((card) => columnIds.includes(card.columnId))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки данных'
    } finally {
      loading.value = false
    }
  }

  // Создать карточку
  async function createCard(cardData: CreateCard) {
    try {
      const newCard = await cardsApi.create(cardData)
      cards.value.push(newCard)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка создания карточки'
    }
  }

  // Удалить карточку
  async function deleteCard(id: number) {
    try {
      await cardsApi.delete(id)
      cards.value = cards.value.filter((c) => c.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка удаления карточки'
    }
  }

  // Переместить карточку в другую колонку
  async function moveCard(cardId: number, columnId: number) {
    try {
      const updated = await cardsApi.moveToColumn(cardId, columnId)
      const index = cards.value.findIndex((c) => c.id === cardId)
      if (index !== -1) {
        cards.value[index] = updated
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка перемещения'
    }
  }

  // Получить карточки конкретной колонки
  function getCardsByColumn(columnId: number): Card[] {
    return cards.value
      .filter((c) => c.columnId === columnId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return {
    boards,
    columns,
    cards,
    loading,
    error,
    fetchBoards,
    fetchBoardData,
    createCard,
    deleteCard,
    moveCard,
    getCardsByColumn,
  }
})