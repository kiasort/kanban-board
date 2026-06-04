<template>
  <div class="error">
    <span class="icon">!</span>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<style scoped>
.error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.75rem;
  flex-shrink: 0;
}

p {
  font-size: 0.875rem;
  margin: 0;
}
</style>