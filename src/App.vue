<template>
  <div id="app">
    <SortingCeremony />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SortingCeremony from './components/SortingCeremony.vue'

// Add explicit component names
export default defineComponent({
  name: 'App', // Add explicit component names
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
