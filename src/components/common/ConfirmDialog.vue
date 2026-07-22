<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="confirm-overlay"
      @click.self="$emit('cancel')"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <div class="confirm-modal">
        <h3 class="confirm-title">{{ title }}</h3>
        <p class="confirm-message">{{ message }}</p>
        <div class="confirm-actions">
          <button type="button" class="btn-cancel" @click="$emit('cancel')">
            Отмена
          </button>
          <button
            type="button"
            class="btn-danger"
            :class="{ 'btn-loading': loading }"
            :disabled="loading"
            @click="$emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    loading?: boolean
  }>(),
  {
    confirmText: 'Удалить',
    loading: false,
  },
)

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
}

.confirm-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
}

.confirm-title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  color: #1e293b;
}

.confirm-message {
  margin: 0 0 1.25rem;
  font-size: 0.9375rem;
  color: #64748b;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
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

.btn-danger {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 6px;
  background: #dc2626;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>