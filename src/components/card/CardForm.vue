<template>
  <form class="card-form" @submit.prevent="handleSubmit">
    <div class="field">
      <label>Название *</label>
      <input v-model="title" type="text" placeholder="Что нужно сделать?" maxlength="100" required />
    </div>

    <div class="field">
      <label>Описание</label>
      <textarea
        v-model="description"
        placeholder="Подробности задачи..."
        rows="3"
        maxlength="500"
        @keydown.enter.ctrl.prevent="handleSubmit"
      ></textarea>
    </div>

    <div class="field">
      <label>Приоритет</label>
      <select v-model="priority">
        <option value="low">Низкий</option>
        <option value="medium">Средний</option>
        <option value="high">Высокий</option>
      </select>
    </div>

    <div class="actions">
      <button type="button" class="btn-cancel" @click="$emit('cancel')">Отмена</button>
      <button type="submit" class="btn-submit">
        {{ isEditing ? 'Сохранить' : 'Создать' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Card, CreateCard } from '@/types'

const props = defineProps<{
  columnId: number
  card?: Card
}>()

const emit = defineEmits<{
  submit: [data: CreateCard]
  cancel: []
}>()

const isEditing = !!props.card

const title = ref(props.card?.title ?? '')
const description = ref(props.card?.description ?? '')
const priority = ref<'low' | 'medium' | 'high'>(props.card?.priority ?? 'medium')

function handleSubmit() {
  if (!title.value.trim()) return

  emit('submit', {
    columnId: props.columnId,
    title: title.value.trim(),
    description: description.value.trim(),
    priority: priority.value,
  })
}
</script>

<style scoped>
.card-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #475569;
}

input,
textarea,
select {
  padding: 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s;
  background: white;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea {
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #64748b;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-cancel:hover {
  background: #f8fafc;
}

.btn-submit {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-submit:hover {
  background: #2563eb;
}
</style>