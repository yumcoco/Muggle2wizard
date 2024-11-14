<template>
  <div class="welcome-container">
    <img src="/assets/dobby-avatar.png" alt="Dobby" class="avatar" />
    <div class="dialog-box">
      <p>多比：“欢迎来到魔法世界，尊贵的麻瓜！请站在分院帽前，让我们开始一场属于你的神奇仪式！”</p>
    </div>
    <button @click="startCeremony" class="start-button">开始仪式</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'TheWelcome',
  setup() {
    const router = useRouter()

    // 引导用户进入分院帽仪式页面
    const startCeremony = () => {
      router.push('/wizard-name')
    }

    return { startCeremony }
  },
})
</script>

<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #5d3b94;
  color: #fff;
  padding: 20px;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 20px;
}

.dialog-box {
  background-color: #713e98;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.start-button {
  background-color: #f0c419;
  color: #5d3b94;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}

.start-button:hover {
  background-color: #f8d74b;
}
</style>
