<template>
  <div class="loader" role="status" aria-label="Загрузка">
    <div class="spinner"></div>
    <p>Загрузка...</p>
  </div>
</template>

<style scoped>
.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748b;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  will-change: transform;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

p {
  margin-top: 0.75rem;
  font-size: 0.875rem;
}
</style>