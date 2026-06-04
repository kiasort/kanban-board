<template>
  <div class="card" :class="priorityClass" @click="$emit('click', card)">
    <div class="card-header">
      <span class="priority-badge" :class="card.priority">
        {{ priorityLabel }}
      </span>
    </div>
    <h4 class="card-title">{{ card.title }}</h4>
    <p v-if="card.description" class="card-desc">{{ card.description }}</p>
    <div class="card-footer">
      <span class="date">{{ formattedDate }}</span>
      <button class="delete-btn" @click.stop="$emit('delete', card.id)" title="Удалить">
        &times;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '@/types'

const props = defineProps<{
  card: Card
}>()

defineEmits<{
  click: [card: Card]
  delete: [id: number]
}>()

const priorityLabel = computed(() => {
  const labels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' }
  return labels[props.card.priority]
})

const priorityClass = computed(() => `priority-${props.card.priority}`)

const formattedDate = computed(() => {
  return new Date(props.card.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.15s;
  border-left: 3px solid transparent;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.priority-high {
  border-left-color: #ef4444;
}
.priority-medium {
  border-left-color: #f59e0b;
}
.priority-low {
  border-left-color: #22c55e;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.priority-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
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

.card-title {
  margin: 0 0 0.375rem;
  font-size: 0.9375rem;
  color: #1e293b;
  font-weight: 600;
}

.card-desc {
  margin: 0;
  font-size: 0.8125rem;
  color: #64748b;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
}

.date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.delete-btn {
  background: none;
  border: none;
  color: #cbd5e1;
  font-size: 1.125rem;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
}

.delete-btn:hover {
  color: #ef4444;
}
</style>
