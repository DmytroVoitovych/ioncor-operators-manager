<template>
<el-button :disabled="isCapturing" :loading="isCapturing" type="primary" plain  round>Make Screenshot</el-button>
</template>

<script lang="ts" setup>
import { useShiftAuth } from '~/composables/useAuth';
import { useScreenshot } from '~/composables/useScreenshot';

const {postfix} = useShiftAuth();

const {captureAndDownload,isCapturing} = useScreenshot(postfix);

defineExpose({captureAndDownload});

</script>

<style lang="scss" scoped>
.el-button{
@include fluid-desktop-font(14px, 17px);
}
</style>
