<template>
  <div class="sorting-hat-container fade-in">
    <lottie-player src="/assets/sortingHat.json" background="transparent" speed="1" loop autoplay class="float"></lottie-player>
    <div class="guidance">欢迎来到巫师世界！请点击分院帽开始仪式。</div>
    <button class="button" @click="start">开始仪式</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    start() {
      this.$router.push('/name');
    }
  }
});
</script>

<style scoped>
.sorting-hat-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}
</style>
