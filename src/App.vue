<template>
  <BaseHeader />
  <EnteringPreloaderLayout :loading :is-authenticated />
  <PasswordForm v-if="!isAuthenticated" :options />
  <RouterView v-else />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useShiftAuth, } from './composables/useAuth';
import { supabase } from './utils/supabase';

const { options, isAuthenticated, loading,loadUserData} = useShiftAuth();

onMounted(()=>supabase.auth.onAuthStateChange(async (event) => {
  if (event === 'SIGNED_IN') await loadUserData();

}));

</script>
<style scoped>
.wrapper {
  display: grid;
}

</style>
