<template>
  <div class="board-page">
    <div class="board-header">
      <router-link to="/" class="back-link">&larr; Все доски</router-link>
      <h1 v-if="board">{{ board.title }}</h1>
    </div>

    <AppLoader v-if="store.loading" />
    <AppError v-else-if="store.error" :message="store.error" />
    <div v-else class="board-content">
      <div class="board-columns">
        <ColumnItem
          v-for="column in store.columns"
          :key="column.id"
          :column="column"
        />

        <button class="add-column-btn" @click="showColumnForm = true">
          + Добавить колонку
        </button>
      </div>
    </div>

    <AppModal title="Новая колонка" :is-open="showColumnForm" @close="showColumnForm = false">
      <ColumnForm @submit="handleCreateColumn" @cancel="showColumnForm = false" />
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
import { boardsApi } from '@/api/boards'
import ColumnItem from '@/components/column/ColumnItem.vue'
import ColumnForm from '@/components/column/ColumnForm.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppError from '@/components/common/AppError.vue'
import AppModal from '@/components/common/AppModal.vue'
import type { Board } from '@/types'

const route = useRoute()
const store = useBoardStore()
const board = ref<Board | null>(null)
const showColumnForm = ref(false)

const boardId = computed(() => Number(route.params.id))

onMounted(async () => {
  try {
    board.value = await boardsApi.getById(boardId.value)
  } catch (e) {
    console.error('Ошибка загрузки доски:', e)
  }
  await store.fetchBoardData(boardId.value)
})

async function handleCreateColumn(title: string) {
  await store.createColumn({
    boardId: boardId.value,
    title,
    order: store.columns.length + 1,
  })
  showColumnForm.value = false
}
</script>

<style scoped>
.board-page {
  padding: 1.5rem;
  min-height: 100vh;
}

.board-header {
  margin-bottom: 1.5rem;
}

.back-link {
  color: #64748b;
  text-decoration: none;
  font-size: 0.875rem;
}

.back-link:hover {
  color: #3b82f6;
}

h1 {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  color: #1e293b;
}

.board-columns {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  align-items: flex-start;
}

.add-column-btn {
  min-width: 200px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  color: #64748b;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  min-height: 100px;
}

.add-column-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

@media (max-width: 768px) {
  .board-page {
    padding: 1rem;
  }

  h1 {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .board-page {
    padding: 0.75rem;
  }

  .board-columns {
    flex-direction: column;
    overflow-x: visible;
  }

  .add-column-btn {
    min-width: 100%;
  }
}
</style>