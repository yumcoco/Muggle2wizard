<!-- src/components/WizardName.vue -->
<template>
  <div class="wizard-name">
    <p class="dialog">
      分院帽：“告诉我你的名字，未来的巫师。你的性格又是怎样的呢？我会通过你的MBTI来找到你的学院归属。”
    </p>
    <input v-model="name" placeholder="输入你的名字" />
    <input v-model="mbti" placeholder="输入你的 MBTI 类型 (如 INTJ)" />
    <button @click="next" class="next-button">下一步</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const name = ref('')
    const mbti = ref('')
    const router = useRouter()

    const next = () => {
      if (name.value && mbti.value) {
        router.push({ name: 'scene-selection', query: { name: name.value, mbti: mbti.value } })
      }
    }

    return { name, mbti, next }
  },
})
</script>
