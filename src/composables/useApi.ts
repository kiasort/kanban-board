import { ref } from 'vue'

export function useApi<T>() {
  const data = ref<T | null>(null) as { value: T | null }
  const loading = ref(false)
  const error = ref('')

  async function execute(apiCall: () => Promise<T>): Promise<void> {
    loading.value = true
    error.value = ''
    try {
      data.value = await apiCall()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Произошла ошибка'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
