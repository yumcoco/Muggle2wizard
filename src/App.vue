<template>
  <div id="app">
    <router-view />
    <button @click="toggleMusic" class="music-toggle">
      {{ isMusicPlaying ? '🔊 关闭音乐' : '🔈 打开音乐' }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'

export default defineComponent({
  setup() {
    const isMusicPlaying = ref(true)
    const backgroundMusic = new Audio('/assets/background-music.mp3')
    backgroundMusic.loop = true

    const playMusic = () => {
      backgroundMusic.play().catch(() => {
        console.log('自动播放被浏览器阻止，需要用户交互后才能播放')
      })
    }

    const toggleMusic = () => {
      if (isMusicPlaying.value) {
        backgroundMusic.pause()
      } else {
        playMusic()
      }
      isMusicPlaying.value = !isMusicPlaying.value
    }

    onMounted(() => {
      playMusic()
    })

    onUnmounted(() => {
      backgroundMusic.pause()
    })

    return { isMusicPlaying, toggleMusic }
  },
})
</script>

<style scoped>
.music-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #fff;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
}
</style>
