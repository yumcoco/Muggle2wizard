<!-- src/views/GenerateContent.vue -->
<template>
  <div class="generate-content">
    <p class="dialog">
      Dobby: "Dobby is preparing your own wand, elf companion, spells and academy! The magic is being performed, please wait!”
    </p>
    <button @click="finishCeremony" class="finish-button">View Wizard Profile</button>
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
