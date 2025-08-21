<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="common-layout">
    <el-container>
      <section class="stationsSection">
        <h1 class="text-preset-5 sectionHeadline">Stations List</h1>
        <StationsList />
      </section>
      <el-aside
        :width="isSmallScreen ? (isSmallTablet ? '100%' : '80%') : isDesktop ? '50%' : '55%'"
      >
        <h1 class="text-preset-5 sectionHeadline">Operators List</h1>
        <WorkersList />
      </el-aside>
    </el-container>
  </div>
</template>
<script lang="ts" setup>
import { useMediaQuery } from "@vueuse/core";

const isSmallScreen = useMediaQuery("(max-width: 1024px)");
const isSmallTablet = useMediaQuery("(max-width: 600px)");
const isDesktop = useMediaQuery("(min-width: 1920px)");
</script>

<style scoped lang="scss">
@include mq(tablet-small) {
  .el-aside {
    max-width: 100vw;
  }
}

.el-container {
  height: 100%;
  padding: 0 20px;
  gap: 20px;

  @include mq(laptop-small) {
    flex-direction: column-reverse;
    align-items: center;
  }
}

.stationsSection {
  flex-grow: 1;
  @include mq(laptop-small) {
    width: 100%;
  }
}

.sectionHeadline {
  display: inline-block;
  padding: 4px 16px 4px 4px;
  background-color: var(--neutral-0);
  border: 2px solid var(--blue-100);
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  border-bottom: none;
  translate: 0px 1.6px;
}
</style>
