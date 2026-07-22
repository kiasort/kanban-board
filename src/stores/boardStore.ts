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

  async function createBoard(data: { title: string; description: string }) {
    try {

      const newBoard = await boardsApi.create(data)
      boards.value.push(newBoard)


      const columnTitles = ['To Do', 'In Progress', 'Done']
      const createdColumns: Column[] = []
      for (let i = 0; i < columnTitles.length; i++) {
        const col = await columnsApi.create({
          boardId: newBoard.id,
          title: columnTitles[i]!,
          order: i + 1,
        })
        createdColumns.push(col)
      }
      columns.value.push(...createdColumns)
      columns.value.sort((a, b) => a.order - b.order)

      // 3. Безопасно достаём id колонок (без TS-варнинга "возможно undefined")
      const todoColumn = createdColumns.find((c) => c.title === 'To Do')
      const progressColumn = createdColumns.find((c) => c.title === 'In Progress')
      const doneColumn = createdColumns.find((c) => c.title === 'Done')


      const sampleCards: CreateCard[] = [
        // To Do
        ...(todoColumn
          ? ([
              {
                columnId: todoColumn.id,
                title: 'Проверить почту',
                description: 'Рабочая почта example@gmail.com',
                priority: 'medium' as const,
              },
              // ... остальное без изменений
            ] satisfies CreateCard[])
          : []),

        ...(progressColumn
          ? [
              {
                columnId: progressColumn.id,
                title: 'Приготовить ужин',
                description: 'Паста с овощами и курицей.',
                priority: 'medium' as const,
              },
              {
                columnId: progressColumn.id,
                title: 'Разобрать шкаф в спальне',
                description: 'Отсортировать вещи на «оставить», «отдать», «выбросить».',
                priority: 'high' as const,
              },
            ]
          : []),

        ...(doneColumn
          ? [
              {
                columnId: doneColumn.id,
                title: 'Оплатить коммунальные счета',
                description: '',
                priority: 'high' as const,
              },
              {
                columnId: doneColumn.id,
                title: 'Записаться на приём к врачу',
                description: 'Терапевт, ежегодный чекап.',
                priority: 'medium' as const,
              },
            ]
          : []),
      ]


      for (const card of sampleCards) {
        const newCard = await cardsApi.create(card)
        cards.value.push(newCard)
      }

      return newBoard
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка создания доски'
    }
  }

  async function deleteBoard(id: number) {
    try {
      await boardsApi.delete(id)
      boards.value = boards.value.filter((b) => b.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка удаления доски'
    }
  }


  async function fetchBoardData(boardId: number) {
    loading.value = true
    error.value = ''
    try {
      const [cols, allCards] = await Promise.all([
        columnsApi.getByBoard(boardId),
        cardsApi.getAll(),
      ])
      columns.value = cols
      const columnIds = cols.map((c) => c.id)
      cards.value = allCards.filter((card) => columnIds.includes(card.columnId))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки данных'
    } finally {
      loading.value = false
    }
  }


  async function createColumn(data: { boardId: number; title: string; order: number }) {
    try {
      const newColumn = await columnsApi.create(data)
      columns.value.push(newColumn)
      // Сортируем по order
      columns.value.sort((a, b) => a.order - b.order)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка создания колонки'
    }
  }

  async function deleteColumn(id: number) {
    try {
      await columnsApi.delete(id)
      columns.value = columns.value.filter((c) => c.id !== id)
      // Удаляем карточки этой колонки из локального состояния
      cards.value = cards.value.filter((c) => c.columnId !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка удаления колонки'
    }
  }


  async function createCard(cardData: CreateCard) {
    try {
      const newCard = await cardsApi.create(cardData)
      cards.value.push(newCard)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка создания карточки'
    }
  }

  async function deleteCard(id: number) {
    try {
      await cardsApi.delete(id)
      cards.value = cards.value.filter((c) => c.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка удаления карточки'
    }
  }

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
  async function moveCardOptimistic(cardId: number, newColumnId: number) {
    const card = cards.value.find((c) => c.id === cardId)
    if (!card) return

    const oldColumnId = card.columnId
    card.columnId = newColumnId  // Оптимистично обновляем UI сразу

    try {
      const updated = await cardsApi.moveToColumn(cardId, newColumnId)
      const index = cards.value.findIndex((c) => c.id === cardId)
      if (index !== -1) {
        cards.value[index] = updated
      }
    } catch (e) {
      // Откатываем при ошибке
      card.columnId = oldColumnId
      error.value = e instanceof Error ? e.message : 'Ошибка перемещения'
    }
  }

  async function updateCard(id: number, data: Partial<Card>) {
    try {
      const updated = await cardsApi.update(id, data)
      const index = cards.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        cards.value[index] = updated
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка обновления карточки'
    }
  }

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
    createBoard,
    deleteBoard,
    fetchBoardData,
    createColumn,
    deleteColumn,
    createCard,
    deleteCard,
    moveCard,
     moveCardOptimistic,
    updateCard,
    getCardsByColumn,
  }
})