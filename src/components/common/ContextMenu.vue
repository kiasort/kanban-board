<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="context-menu-overlay"
      @click="close"
      @contextmenu.prevent="close"
    >
      <div
        class="context-menu"
        :style="{ top: `${adjustedY}px`, left: `${adjustedX}px` }"
        @click.stop
      >
        <ul class="menu-list">
          <li class="menu-item" @click="handleAction('edit')">
            <span class="icon">✏️</span>
            <span>Редактировать</span>
          </li>
          <li class="menu-item" @click="handleAction('move')">
            <span class="icon">↔️</span>
            <span>Переместить</span>
          </li>
          <li class="menu-divider"></li>
          <li class="menu-item" @click="handleAction('priority-low')">
            <span class="icon priority low">●</span>
            <span>Низкий приоритет</span>
          </li>
          <li class="menu-item" @click="handleAction('priority-medium')">
            <span class="icon priority medium">●</span>
            <span>Средний приоритет</span>
          </li>
          <li class="menu-item" @click="handleAction('priority-high')">
            <span class="icon priority high">●</span>
            <span>Высокий приоритет</span>
          </li>
          <li class="menu-divider"></li>
          <li class="menu-item danger" @click="handleAction('delete')">
            <span class="icon">🗑</span>
            <span>Удалить</span>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

export type ContextMenuAction =
  | 'edit'
  | 'move'
  | 'priority-low'
  | 'priority-medium'
  | 'priority-high'
  | 'delete'

const props = defineProps<{
  isOpen: boolean
  x: number
  y: number
}>()

const emit = defineEmits<{
  close: []
  action: [action: ContextMenuAction]
}>()

// Корректируем позицию, чтобы меню не уходило за экран
const adjustedX = ref(0)
const adjustedY = ref(0)

watch(
  () => [props.x, props.y, props.isOpen],
  async () => {
    if (!props.isOpen) return
    await nextTick()
    // Меню шириной ~220px, высотой ~280px
    const menuWidth = 220
    const menuHeight = 280
    adjustedX.value = Math.min(props.x, window.innerWidth - menuWidth - 10)
    adjustedY.value = Math.min(props.y, window.innerHeight - menuHeight - 10)
  },
  { immediate: true },
)

function close() {
  emit('close')
}

function handleAction(action: ContextMenuAction) {
  emit('action', action)
  close()
}
</script>

<style scoped>
.context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 0.375rem;
  z-index: 1101;
  animation: menuAppear 0.15s ease-out;
}

@keyframes menuAppear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #1e293b;
  transition: background 0.15s;
}

.menu-item:hover {
  background: #f1f5f9;
}

.menu-item.danger {
  color: #dc2626;
}

.menu-item.danger:hover {
  background: #fef2f2;
}

.icon {
  width: 18px;
  text-align: center;
  font-size: 0.875rem;
}

.icon.priority {
  font-size: 0.625rem;
}

.icon.priority.low {
  color: #22c55e;
}
.icon.priority.medium {
  color: #f59e0b;
}
.icon.priority.high {
  color: #ef4444;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.375rem 0.5rem;
}
</style>