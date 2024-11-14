<template>
  <div class="ceremony-start">
    <img src="/assets/dobby-avatar.png" alt="Dobby" class="avatar" />
    <p>多比：“欢迎来到魔法世界，尊贵的麻瓜！请站在分院帽前，让我们开始一场属于你的神奇仪式！”</p>
    <button @click="startCeremony">开始仪式</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const router = useRouter()
    const startCeremony = () => {
      router.push('/wizard-name')
    }
    return { startCeremony }
  },
})
</script>
