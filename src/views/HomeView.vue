<template>
  <div class="home">
    <h1>Канбан-доски</h1>

    <AppLoader v-if="store.loading" />
    <AppError v-else-if="store.error" :message="store.error" />
    <div v-else class="boards-list">
      <router-link
        v-for="board in store.boards"
        :key="board.id"
        :to="`/board/${board.id}`"
        class="board-card"
      >
        <h2>{{ board.title }}</h2>
        <p>{{ board.description }}</p>
      </router-link>

      <AppEmpty v-if="store.boards.length === 0" message="Нет досок" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBoardStore } from '@/stores/boardStore'
import AppLoader from '@/components/common/AppLoader.vue'
import AppError from '@/components/common/AppError.vue'
import AppEmpty from '@/components/common/AppEmpty.vue'

const store = useBoardStore()

onMounted(() => {
  store.fetchBoards()
})
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.boards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.board-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  text-decoration: none;
  transition: box-shadow 0.2s, transform 0.15s;
}

.board-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.board-card h2 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  color: #1e293b;
}

.board-card p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}
</style>