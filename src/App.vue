<template>
  <div id="app">
    <SortingCeremony />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SortingCeremony from './components/SortingCeremony.vue'

// 添加明确的组件名称
export default defineComponent({
  name: 'App', // 添加显式的组件名称
  components: {
    SortingCeremony,
  },
})
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
