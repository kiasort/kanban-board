<template>
  <form class="board-form" @submit.prevent="handleSubmit">
    <div class="field">
      <label>Название доски *</label>
      <input
        v-model="title"
        type="text"
        placeholder="Например: Мой проект"
        maxlength="50"
        required
        autofocus
      />
    </div>

    <div class="field">
      <label>Описание</label>
      <textarea
        v-model="description"
        placeholder="Краткое описание доски..."
        rows="2"
        maxlength="200"
        @keydown.enter.ctrl.prevent="handleSubmit"
      ></textarea>>
    </div>

    <div class="actions">
      <button type="button" class="btn-cancel" @click="$emit('cancel')">Отмена</button>
      <button type="submit" class="btn-submit">Создать</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [data: { title: string; description: string }]
  cancel: []
}>()

const title = ref('')
const description = ref('')

function handleSubmit() {
  if (!title.value.trim()) return
  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim(),
  })
}
</script>

<style scoped>
.board-form {
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
textarea {
  padding: 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

input:focus,
textarea:focus {
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