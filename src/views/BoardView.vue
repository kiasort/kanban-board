<template>
  <div class="board-page">
    <div class="board-header">
      <router-link to="/" class="back-link">&larr; Все доски</router-link>
      <h1 v-if="board">{{ board.title }}</h1>
    </div>

    <AppLoader v-if="store.loading" />
    <AppError v-else-if="store.error" :message="store.error" />
    <div v-else class="board-columns">
      <ColumnItem
        v-for="column in store.columns"
        :key="column.id"
        :column="column"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
import { boardsApi } from '@/api/boards'
import ColumnItem from '@/components/column/ColumnItem.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppError from '@/components/common/AppError.vue'
import type { Board } from '@/types'

const route = useRoute()
const store = useBoardStore()

const board = ref<Board | null>(null)

const boardId = computed(() => Number(route.params.id))

onMounted(async () => {
  board.value = await boardsApi.getById(boardId.value)
  await store.fetchBoardData(boardId.value)
})
</script>

<script lang="ts">
import { ref } from 'vue'
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
}
</style>