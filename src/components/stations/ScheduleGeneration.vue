<template>
  <section class="scheduleGeneration">
    <h3>Schedule Generation</h3>
    <el-form label-position="top">
      <el-form-item label="Rotation settings">
        <el-radio-group v-model="radio">
          <el-radio :value="2">Every two hours</el-radio>
          <el-radio :value="4">Every four hours</el-radio>
          <el-radio :value="8">full day</el-radio>
        </el-radio-group></el-form-item
      >
      <el-form-item label="Period Selection">
        <el-radio-group v-model="period">
          <el-radio value="1">Day</el-radio>
          <el-radio value="5">Week</el-radio>
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
import { computed, ref, toRaw, toRef, toRefs, useTemplateRef, watch } from "vue";
import { Operator, StationNumber, STATIONS } from "~/maintypes/types";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
import { generateSchedule } from "./utils/scheduleGenerator";

const workersStore = useWorkersStore();
const stationsStore = useStationsStore();

const availableWorkers = computed(() =>
  workersStore.workers
    .filter((worker) => worker.status === "available")
    // .toSorted(
    //   (a, b) =>
    //     a.station_history?.filter((st) => st.station === "130").length -
    //     b.station_history?.filter((st) => st.station === "130").length,
    // )
    .toSorted((a, b) => a.known_stations.length - b.known_stations.length),
);
const stations = stationsStore.getStations;

const radio = ref(2);
const period = ref("1");
const date = ref("");
const btn = useTemplateRef("btn");
const count = ref(0);

const test = () => {
  // count.value++;

  for (let index = 0; index < 4; index++) {
    //  console.log("test", index);
    generateSchedule(stationsStore, availableWorkers.value, stations);
    console.log(index);
  if((index + 1) % 4 === 0){

    console.log(
    availableWorkers.value
      .filter((e) => e.known_stations.includes("130"))
      .map(
        (e) =>
          `${e.name + "" + e.surname}:${e.station_history.slice(-20).filter((st) => st.station === "130").length}:known${e.known_stations.length}`,
      )
  );
}
  }

  // if(count.value < 19) test();
};
/// 130 control station check tomorrow

watch(count, (newCount) => {
 console.log(`Count updated: ${newCount}`);
},{immediate:true});
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
