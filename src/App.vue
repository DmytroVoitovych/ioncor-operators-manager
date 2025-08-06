<template>
  <BaseHeader />
  <EnteringPreloaderLayout :loading :is-authenticated />
  <PasswordForm v-if="!isAuthenticated" :options />
  <RouterView v-else />
</template>

<script lang="ts" setup>
import { useShiftAuth, } from './composables/useAuth';


const { options, isAuthenticated, loading} = useShiftAuth();



</script>
<style scoped>
.wrapper {
  display: grid;
}

</style>
