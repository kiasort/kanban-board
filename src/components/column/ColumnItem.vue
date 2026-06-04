<template>
  <div class="column">
    <div class="column-header">
      <h3 class="column-title">{{ column.title }}</h3>
      <span class="card-count">{{ columnCards.length }}</span>
    </div>

    <div class="cards-list">
      <CardItem
        v-for="card in columnCards"
        :key="card.id"
        :card="card"
        @click="selectedCard = card"
        @delete="store.deleteCard"
      />

      <AppEmpty v-if="columnCards.length === 0" message="Нет задач" />
    </div>

    <button class="add-card-btn" @click="showForm = true">+ Добавить задачу</button>

    <AppModal title="Новая задача" :is-open="showForm" @close="showForm = false">
      <CardForm :column-id="column.id" @submit="handleCreate" @cancel="showForm = false" />
    </AppModal>

    <AppModal
      :title="selectedCard?.title ?? ''"
      :is-open="!!selectedCard"
      @close="selectedCard = null"
    >
      <div v-if="selectedCard" class="card-detail">
        <p class="detail-desc">{{ selectedCard.description || 'Нет описания' }}</p>
        <div class="detail-meta">
          <span class="priority-badge" :class="selectedCard.priority">
            {{ { low: 'Низкий', medium: 'Средний', high: 'Высокий' }[selectedCard.priority] }}
          </span>
          <span class="detail-date">
            {{ new Date(selectedCard.createdAt).toLocaleDateString('ru-RU') }}
          </span>
        </div>
        <div class="detail-actions">
          <select :value="selectedCard.columnId" @change="handleMove" class="move-select">
            <option v-for="col in allColumns" :key="col.id" :value="col.id">
              {{ col.title }}
            </option>
          </select>
          <button class="btn-delete" @click="handleDeleteDetail">Удалить</button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBoardStore } from '@/stores/boardStore'
import type { Column, Card, CreateCard } from '@/types'
import CardItem from '@/components/card/CardItem.vue'
import CardForm from '@/components/card/CardForm.vue'
import AppModal from '@/components/common/AppModal.vue'
import AppEmpty from '@/components/common/AppEmpty.vue'

const props = defineProps<{
  column: Column
}>()

const store = useBoardStore()

const showForm = ref(false)
const selectedCard = ref<Card | null>(null)

const columnCards = computed(() => store.getCardsByColumn(props.column.id))
const allColumns = computed(() => store.columns)

async function handleCreate(data: CreateCard) {
  await store.createCard(data)
  showForm.value = false
}

async function handleMove(event: Event) {
  const target = event.target as HTMLSelectElement
  const newColumnId = Number(target.value)
  if (selectedCard.value) {
    await store.moveCard(selectedCard.value.id, newColumnId)
    selectedCard.value = null
  }
}

async function handleDeleteDetail() {
  if (selectedCard.value) {
    await store.deleteCard(selectedCard.value.id)
    selectedCard.value = null
  }
}
</script>

<style scoped>
.column {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 1rem;
  min-width: 280px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0 0.25rem;
}

.column-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #334155;
}

.card-count {
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.cards-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-right: 0.25rem;
}

.add-card-btn {
  width: 100%;
  padding: 0.625rem;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  background: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.add-card-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

/* Card detail in modal */
.card-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-desc {
  margin: 0;
  color: #475569;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.priority-badge {
  font-size: 0.75rem;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.priority-badge.high {
  background: #fef2f2;
  color: #dc2626;
}
.priority-badge.medium {
  background: #fffbeb;
  color: #d97706;
}
.priority-badge.low {
  background: #f0fdf4;
  color: #16a34a;
}

.detail-date {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.detail-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.move-select {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.btn-delete {
  padding: 0.5rem 1rem;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fef2f2;
  color: #dc2626;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-delete:hover {
  background: #fee2e2;
}
</style>