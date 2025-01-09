import { ref } from 'vue';

export function useMusicGen() {
  const loading = ref(false);
  const result = ref<Blob | null>(null);
  const error = ref<string | null>(null);

  async function queryMusicGen(prompt: string) {
    loading.value = true;
    error.value = null;
    result.value = null;

    try {
      const API_URL = 'https://api-inference.huggingface.co/models/facebook/musicgen-small';
      const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || 'hf_example_token';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      result.value = audioBlob;
    } catch (err: any) {
      error.value = err.message || 'Request failed';
    } finally {
      loading.value = false;
    }
  }

  const audioUrl = ref<string | null>(null);

  // Create a URL for the audio result
  const getAudioUrl = () => {
    if (result.value) {
      audioUrl.value = URL.createObjectURL(result.value);
    }
  };

  return {
    loading,
    result,
    error,
    queryMusicGen,
    audioUrl,
    getAudioUrl,
  };
}
