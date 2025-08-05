<template>
<el-button :disabled="isCapturing" :loading="isCapturing" type="primary" plain  round>Make Screenshot</el-button>
</template>

<script lang="ts" setup>
import { useScreenshot } from '~/composables/useScreenshot';

const {captureAndDownload,isCapturing} = useScreenshot();

defineExpose({captureAndDownload});

</script>
