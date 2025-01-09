import { ref, computed } from 'vue';

export function useMusicGen() {
  const Musicloading = ref(false);
  const Musicresult = ref<Blob | null>(null);
  const Misicerror = ref<string | null>(null);

  async function queryMusicGen(data: { inputs: string }) {
    Musicloading.value = true;
    Misicerror.value = null;
    Musicresult.value = null;

    try {
      const API_URL = 'https://api-inference.huggingface.co/models/facebook/musicgen-small';
      const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

      if (!HF_TOKEN) {
        throw new Error('Hugging Face token is not set in environment variables.');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorDetails.Misicerror || 'Unknown error'}`);
      }

      const audioBlob = await response.blob();
      Musicresult.value = audioBlob;
    } catch (err: any) {
      Misicerror.value = err.message || 'Request failed';
    } finally {
      Musicloading.value = false;
    }
  }

  //compute the audio URL
  const audioUrl = computed(() => {
    if (Musicresult.value) {
      return URL.createObjectURL(Musicresult.value);
    }
    return null;
  });

  return {
    Musicloading,
    Musicresult,
    Misicerror,
    queryMusicGen,
    audioUrl,
  };
}
