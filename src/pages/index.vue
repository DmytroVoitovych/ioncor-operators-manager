<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="common-layout" >
    <el-container>
      <section class="stationsSection">
        <h1 class="text-preset-5 sectionHeadline">Stations List</h1>
        <StationsList />
      </section>
      <el-aside width="55%">
        <h1 class="text-preset-5 sectionHeadline">Operators List</h1>
        <WorkersList />
      </el-aside>
    </el-container>
  </div>
</template>
<script lang="ts" setup>


</script>

<style scoped>
.el-container {
  height: 100%;
  padding: 0 20px;
  gap: 20px;
}

.stationsSection {
  flex-grow: 1;
}

.sectionHeadline{
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
