<template>
  <div class="wish-input">
    <p>分院帽：“告诉我你的愿望吧，这将帮助我们生成专属的魔杖和咒语。”</p>
    <input v-model="wish" placeholder="输入你的愿望" />
    <button @click="next">下一步</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const wish = ref('')
    const router = useRouter()

    const next = () => {
      router.push('/generate-content')
    }

    return { wish, next }
  },
})
</script>
