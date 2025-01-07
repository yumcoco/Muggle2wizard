// src/composables/useHuggingFace.ts
import { ref } from 'vue'

export function useHuggingFace() {
  const loading = ref(false)
  const result = ref<Blob | null>(null)
  const error = ref<string | null>(null)

  async function queryHuggingFace(payload: Record<string, unknown>) {
    loading.value = true
    error.value = null
    result.value = null

    try {
      const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || 'hf_example_token'

      const response = await fetch(
        'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload), // payload = { inputs: 'Your Prompt' }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blobData = await response.blob()
      result.value = blobData
    } catch (err: any) {
      error.value = err?.message || 'Request failed'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    result,
    error,
    queryHuggingFace,
  }
}
