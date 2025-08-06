<template>
 <transition name="fade">
    <div v-if="loading && !isAuthenticated" class="loading-overlay" aria-busy="true" aria-label="Loading application">
      <div class="spinner"></div>
      <div class="loading-text">
        <span v-for="(letter, index) in 'IONCOR...'.split('')" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">
          {{ letter }}
        </span>
      </div>
    </div>
  </transition>
</template>


<script lang="ts" setup>

defineProps<{
isAuthenticated:boolean,
loading:boolean
}>();

</script>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.spinner {
  border: 8px solid var(--blue-100);
  border-top: 8px solid var(--el-color-primary);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.loading-text {
  margin-top: 20px;
}
.loading-text span {
  display: inline-block;
  font-size: 42px;
  font-weight: bold;
  color: var(--el-color-primary);
  animation: bounce 0.6s ease infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


</style>
