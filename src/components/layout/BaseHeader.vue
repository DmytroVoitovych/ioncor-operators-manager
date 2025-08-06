<template>
  <header>
    <AppLogo />
    <div v-if="currentShift" class="headerLogoutBlock text-preset-5">
      <p>{{ currentShift?.split('_').join(' ') }}</p>
      <el-button @click="leaveJob" type="primary"  plain >Exit</el-button>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useShiftAuth } from '~/composables/useAuth';

const {currentShift,logout} = useShiftAuth();
const loading = ref(false);

const leaveJob = ()=>{
loading.value = true;
logout().finally(()=>loading.value = false)
};

</script>

<style lang="scss" scoped>
header{
display: flex;
justify-content: space-between;
padding: 16px 20px;

& .headerLogoutBlock{
display: flex;
align-items: center;
gap: 12px;
}
}
</style>
