<template>
  <div class="column">
    <div class="column-header">
      <h3 class="column-title">{{ column.title }}</h3>
      <div class="header-controls">
        <span class="card-count">{{ localCards.length }}</span>
        <button
          class="delete-column-btn"
          title="Удалить колонку"
          @click="handleDeleteColumn"
        >
          &times;
        </button>
      </div>
    </div>

    <draggable
      :list="localCards"
      group="cards"
      item-key="id"
      :animation="200"
      ghost-class="ghost-card"
      chosen-class="chosen-card"
      drag-class="drag-card"
      class="cards-list"
      @change="handleChange"
    >
      <template #item="{ element: card }">
        <CardItem
          :card="card"
          @click="selectedCard = card"
          @delete="store.deleteCard"
          @contextmenu="handleContextMenu($event, card)"
        />
      </template>

      <template #footer>
        <div v-if="localCards.length === 0" class="empty-placeholder">
          Нет задач
        </div>
      </template>
    </draggable>

    <button class="add-card-btn" @click="showCardForm = true">+ Добавить задачу</button>

    <!-- Форма создания -->
    <AppModal title="Новая задача" :is-open="showCardForm" @close="showCardForm = false">
      <CardForm :column-id="column.id" @submit="handleCreateCard" @cancel="showCardForm = false" />
    </AppModal>

    <!-- Детали карточки (левый клик) -->
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
          <button class="btn-edit" @click="openEditMode(selectedCard)">Редактировать</button>
          <button class="btn-delete" @click="handleDeleteDetail">Удалить</button>
        </div>
      </div>
    </AppModal>

    <!-- Форма редактирования (правый клик → Редактировать) -->
    <AppModal
      title="Редактирование задачи"
      :is-open="!!editingCard"
      @close="editingCard = null"
    >
      <CardEditForm
        v-if="editingCard"
        :card="editingCard"
        :columns="allColumns"
        @submit="handleSaveEdit"
        @cancel="editingCard = null"
      />
    </AppModal>

    <!-- Контекстное меню -->
    <ContextMenu
      :is-open="!!contextMenuCard"
      :x="contextMenuX"
      :y="contextMenuY"
      @close="contextMenuCard = null"
      @action="handleContextAction"
    />

    <!-- Диалог подтверждения удаления -->
    <ConfirmDialog
      :is-open="confirmState.open"
      :title="confirmState.title"
      :message="confirmState.message"
      @confirm="handleConfirm"
      @cancel="handleCancelConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { useBoardStore } from '@/stores/boardStore'
import type { Column, Card, CreateCard } from '@/types'
import CardItem from '@/components/card/CardItem.vue'
import CardForm from '@/components/card/CardForm.vue'
import CardEditForm from '@/components/card/CardEditForm.vue'
import AppModal from '@/components/common/AppModal.vue'
import ContextMenu, { type ContextMenuAction } from '@/components/common/ContextMenu.vue'
import ConfirmDialog from '../common/ConfirmDialog.vue'
const props = defineProps<{
  column: Column
}>()

const store = useBoardStore()

const showCardForm = ref(false)
const selectedCard = ref<Card | null>(null)
const editingCard = ref<Card | null>(null)

// Контекстное меню
const contextMenuCard = ref<Card | null>(null)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
// Диалог подтверждения удаления (карточка или колонка)
const confirmState = ref<{
  open: boolean
  title: string
  message: string
  action: 'card' | 'column' | null
  cardId: number | null
}>({
  open: false,
  title: '',
  message: '',
  action: null,
  cardId: null,
})

function openConfirmCard(card: Card) {
  confirmState.value = {
    open: true,
    title: 'Удалить задачу?',
    message: `Задача «${card.title}» будет удалена безвозвратно.`,
    action: 'card',
    cardId: card.id,
  }
}

function openConfirmColumn() {
  confirmState.value = {
    open: true,
    title: 'Удалить колонку?',
    message: `Колонка «${props.column.title}» и все задачи в ней будут потеряны.`,
    action: 'column',
    cardId: null,
  }
}

async function handleConfirm() {
  if (confirmState.value.action === 'card' && confirmState.value.cardId !== null) {
    await store.deleteCard(confirmState.value.cardId)
    // Заодно закрываем модалку с деталями, если открыта
    if (selectedCard.value?.id === confirmState.value.cardId) {
      selectedCard.value = null
    }
  } else if (confirmState.value.action === 'column') {
    await store.deleteColumn(props.column.id)
  }
  confirmState.value = {
    open: false,
    title: '',
    message: '',
    action: null,
    cardId: null,
  }
}

function handleCancelConfirm() {
  confirmState.value = {
    open: false,
    title: '',
    message: '',
    action: null,
    cardId: null,
  }
}

const storeCards = computed(() => store.getCardsByColumn(props.column.id))
const localCards = ref<Card[]>([...storeCards.value])

watch(
  storeCards,
  (newCards) => {
    const oldJson = JSON.stringify(localCards.value)
    const newJson = JSON.stringify(newCards)
    if (oldJson !== newJson) {
      localCards.value = newCards.map((c) => ({ ...c }))
    }
  },
  { immediate: true, deep: true },
)

const allColumns = computed(() => store.columns)

async function handleCreateCard(data: CreateCard) {
  await store.createCard(data)
  showCardForm.value = false
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
    openConfirmCard(selectedCard.value)
  }
}

async function handleDeleteColumn() {
  openConfirmColumn()
}

function handleContextMenu(event: MouseEvent, card: Card) {
  event.preventDefault()
  contextMenuCard.value = card
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
}

async function handleContextAction(action: ContextMenuAction) {
  const card = contextMenuCard.value
  if (!card) return

  switch (action) {
    case 'edit':
      openEditMode(card)
      break
    case 'move':
      // Открываем детали (там есть select для перемещения)
      selectedCard.value = card
      break
    case 'priority-low':
      await store.updateCard(card.id, { priority: 'low' })
      break
    case 'priority-medium':
      await store.updateCard(card.id, { priority: 'medium' })
      break
    case 'priority-high':
      await store.updateCard(card.id, { priority: 'high' })
      break
    case 'delete':
      openConfirmCard(card)
      break
  }
  contextMenuCard.value = null
}

function openEditMode(card: Card) {
  selectedCard.value = null
  editingCard.value = card
}

async function handleSaveEdit(data: {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  columnId: number
}) {
  if (editingCard.value) {
    await store.updateCard(editingCard.value.id, data)
    // Если колонка изменилась — обновляем через move
    if (data.columnId !== editingCard.value.columnId) {
      await store.moveCard(editingCard.value.id, data.columnId)
    }
    editingCard.value = null
  }
}

// ===== Drag-and-drop =====
interface DragChangeEvent {
  added?: { element: Card; newIndex: number }
  removed?: { element: Card; oldIndex: number }
  moved?: { element: Card; oldIndex: number; newIndex: number }
}

async function handleChange(evt: DragChangeEvent) {
  if (evt.added) {
    await store.moveCardOptimistic(evt.added.element.id, props.column.id)
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

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-count {
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.delete-column-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #94a3b8;
  font-size: 1.125rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s, color 0.2s;
}

.column:hover .delete-column-btn {
  opacity: 1;
}

.delete-column-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.cards-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-right: 0.25rem;
  min-height: 80px;
}

.ghost-card {
  opacity: 0.4;
  background: #dbeafe !important;
  border: 2px dashed #3b82f6 !important;
}

.chosen-card {
  cursor: grabbing;
  transform: rotate(2deg);
}

.drag-card {
  opacity: 0.9;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
}

.empty-placeholder {
  padding: 1.25rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.8125rem;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.4);
  margin-top: auto;
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
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.move-select {
  flex: 1;
  min-width: 120px;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.btn-edit {
  padding: 0.5rem 1rem;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #eff6ff;
  color: #2563eb;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-edit:hover {
  background: #dbeafe;
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

@media (max-width: 480px) {
  .column {
    min-width: 100%;
    max-width: 100%;
    max-height: none;
  }

  .delete-column-btn {
    opacity: 1;
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>