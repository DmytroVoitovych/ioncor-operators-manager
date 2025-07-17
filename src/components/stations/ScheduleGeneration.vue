<template>
  <section class="scheduleGeneration">
    <h3>Schedule Generation</h3>
    <el-form label-position="top">
      <el-form-item label="Rotation settings">
        <el-radio-group v-model="timeRotation">
          <el-radio :value="4">Every two hours</el-radio>
          <el-radio :value="2">Every four hours</el-radio>
          <el-radio :value="1">full day</el-radio>
        </el-radio-group></el-form-item
      >
      <el-form-item label="Period Selection">
        <el-radio-group v-model="period">
          <el-radio :value="1">Day</el-radio>
          <el-radio :value="5">Week</el-radio>
        </el-radio-group>
        <div class="castomDateBlock">
          <span>Custom date period</span>
          <el-date-picker
            v-model="date"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            :editable="false"
          />
        </div>
      </el-form-item>
    </el-form>
    <el-button
      ref="btn"
      size="large"
      class="scheduleButton"
      type="primary"
      @click="
        () => {
          console.time();
          test();
          console.timeEnd();
          // count = 0;
        }
      "
      >Generate Schedule</el-button
    >
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
import { generateSchedule } from "./utils/scheduleGenerator";
import { dayjs } from "element-plus";
// import { Operator } from "~/maintypes/types";

const workersStore = useWorkersStore();
const stationsStore = useStationsStore();

const availableWorkers = computed(() =>
  workersStore.workers
    .filter((worker) => worker.status === "available")
    .toSorted((a, b) => a.known_stations.length - b.known_stations.length)
);
const stations = stationsStore.getStations;

const timeRotation = ref(2);
const period = ref(1);
const date = ref("");
const btn = useTemplateRef("btn");
const snapshotMap = new Map();

const interationsAmount = computed<number>(() => timeRotation.value * period.value);

const makeKey = (date: Date, rotation: number) =>
  `${dayjs(date).format("YYYY-MM-DD")}_${rotation}`;

const test = () => {
  const date = new Date();

  for (let index = 0; index < interationsAmount.value; index++) {
    const copy = generateSchedule(stationsStore, availableWorkers.value, stations);
    snapshotMap.set(makeKey(date, index + 1), copy);
  }

  stationsStore.snapshot = Object.fromEntries(snapshotMap);
  console.log(stationsStore.snapshot);
};

watch(date, (n) => console.log(n));
</script>

<style scoped lang="scss">
.el-form {
  display: flex;
  justify-content: space-evenly;
}

.el-form-item {
  :deep(.el-form-item__content) {
    flex-direction: column;
  }
}

.el-radio-group {
  flex-direction: column;
  align-self: start;

  & .el-radio {
    align-self: start;
  }
}

.castomDateBlock {
  span {
    display: block;
  }
}

.scheduleButton {
  display: block;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}
</style>
