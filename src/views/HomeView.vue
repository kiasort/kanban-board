<template>
  <div class="home">
    <div class="header-row">
      <h1>Канбан-доски</h1>
      <button class="btn-add" @click="showForm = true">+ Новая доска</button>
    </div>

    <AppLoader v-if="store.loading" />
    <AppError v-else-if="store.error" :message="store.error" />
    <div v-else class="boards-list">
      <div v-for="board in store.boards" :key="board.id" class="board-card-wrapper">
        <router-link :to="`/board/${board.id}`" class="board-card">
          <h2>{{ board.title }}</h2>
          <p>{{ board.description || 'Без описания' }}</p>
        </router-link>
        <button
          class="delete-board-btn"
          title="Удалить доску"
          @click="handleDelete(board.id, board.title)"
        >
          &times;
        </button>
      </div>

      <AppEmpty v-if="store.boards.length === 0" message="Нет досок. Создайте первую!" />
    </div>

    <AppModal title="Новая доска" :is-open="showForm" @close="showForm = false">
      <BoardForm @submit="handleCreate" @cancel="showForm = false" />
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
import BoardForm from '@/components/board/boardForm.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppError from '@/components/common/AppError.vue'
import AppEmpty from '@/components/common/AppEmpty.vue'
import AppModal from '@/components/common/AppModal.vue'

const store = useBoardStore()
const router = useRouter()
const showForm = ref(false)

onMounted(() => {
  store.fetchBoards()
})

async function handleCreate(data: { title: string; description: string }) {
  const newBoard = await store.createBoard(data)
  showForm.value = false
  if (newBoard) {
    router.push(`/board/${newBoard.id}`)
  }
}

async function handleDelete(id: number, title: string) {
  if (confirm(`Удалить доску «${title}»? Все колонки и карточки будут потеряны.`)) {
    await store.deleteBoard(id)
  }
}
</script>

<style scoped>
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0;
}

.btn-add {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #2563eb;
}

.boards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.board-card-wrapper {
  position: relative;
}

.board-card {
  display: block;
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

.delete-board-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: white;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s, color 0.2s;
}

.board-card-wrapper:hover .delete-board-btn {
  opacity: 1;
}

.delete-board-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

@media (max-width: 480px) {
  .home {
    padding: 1rem;
  }

  h1 {
    font-size: 1.25rem;
  }

  .header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .boards-list {
    grid-template-columns: 1fr;
  }

  .delete-board-btn {
    opacity: 1;
  }
}
</style>