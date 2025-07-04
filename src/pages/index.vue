<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="common-layout">
    <el-container>
      <!-- <el-aside width="20%">Managers List</el-aside> -->
      <section class="stationsSection">
        <h1 class="text-preset-5">Stations List</h1>
        <StationsList />
      </section>
      <el-aside width="50%">
        <h1 class="text-preset-5">Operators List</h1>
        <WorkersList />
      </el-aside>
    </el-container>
  </div>
</template>
<script lang="ts" setup></script>

<style scoped>
.el-container {
  height: 100%;
  padding: 0 20px;
  gap: 20px;
}

.stationsSection {
  flex-grow: 1;
}
</style>
