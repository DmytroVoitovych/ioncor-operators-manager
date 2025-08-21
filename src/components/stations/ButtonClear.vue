<template>
  <el-button type="danger" :icon="Close" size="small" class="clear-btn" />
</template>

<script setup lang="ts">
import { Close } from "@element-plus/icons-vue";
</script>

<style lang="scss" scoped>
.clear-btn {
  position: absolute;
  left: 2px;
  top: 50%;
  translate: 0 -50%;
  border-radius: 50%;
  padding: 4px 8px;

  @media (hover: hover) {
    display: none;
  }
}
</style>
