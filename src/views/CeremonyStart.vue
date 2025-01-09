<template>
  <div class="ceremony-start">
    <img src="/assets/dobby-avatar.png" alt="Dobby" class="avatar" />
    <p>Dobby: "Welcome to the wizarding world, honorable Muggle! Please stand in front of the Sorting Hat and let us begin a magical ceremony of your own!”</p>
    <button @click="startCeremony">Start the ceremony</button>
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
