<!-- src/components/SceneSelection.vue -->
<template>
  <div class="scene-selection">
    <p class="dialog">
      多比：“告诉多比你想要的仪式场景吧！比如‘古老的森林’或‘神秘的湖泊’。多比会用魔法让它成为现实！”
    </p>
    <input v-model="scene" placeholder="输入场景名称" />
    <button @click="generateScene" class="generate-button">生成场景</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const scene = ref('')

    const generateScene = () => {
      // 调用 API 根据场景生成背景图
      console.log(`生成场景：${scene.value}`)
    }

    return { scene, generateScene }
  },
})
</script>
