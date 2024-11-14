<!-- src/views/GenerateContent.vue -->
<template>
  <div class="generate-content">
    <p class="dialog">
      多比：“多比正在为您准备专属魔杖、精灵伙伴、咒语和学院！魔法正在施展中，请稍等！”
    </p>
    <button @click="finishCeremony" class="finish-button">查看巫师档案</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const router = useRouter()

    const finishCeremony = () => {
      router.push('/wizard-profile')
    }

    return { finishCeremony }
  },
})
</script>
