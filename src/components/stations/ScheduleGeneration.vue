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
    <el-button size="large" class="scheduleButton" type="primary" @click="generateSchedule"
      >Generate Schedule</el-button
    >
  </section>
</template>

<script setup lang="ts">
import { computed, ref, toRef, toRefs } from "vue";
import { StationNumber } from "~/maintypes/types";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
import { SideKey } from "./types";

const workersStore = useWorkersStore();
const stationsStore = useStationsStore();

const availableWorkers = computed(() =>
  workersStore.workers.filter((worker) => worker.status === "available"),
);
const stations = stationsStore.getStations;

const radio = ref(2);
const period = ref("1");
const date = ref("");

const generateSchedule = () => {
  const stationsKeys = Object.keys(stations);
  const arr:StationNumber[] = [];
  stationsStore.assignments = {};

  const choseSide = (
    checkStation: StationNumber
  ) =>
   {
    if(stations[checkStation] === 2){
      return stationsStore.assignments[checkStation]?.left? 'right':'left';
    }

     return 'right';
   };

   for (let index = 0; index < availableWorkers.value.length; index++) {

    // console.log('first for');
    for (let i = 0; i < stationsKeys.length; i++) {
      const stationId = stationsKeys[i];
      const worker = availableWorkers.value[index];
      const isAssigned = stationsStore.getAssignment(stationId, choseSide(stationsStore.assignments[stationId]));
      const isKnown = worker.known_stations.includes(stationId as StationNumber);

      // console.log(worker, worker.visited_stations?.includes(stationId));
      if(!isKnown) continue;
      if(( worker.visited_stations?.includes(stationId) )) continue;

     if(stationId === '170')console.log(worker,choseSide(stationId),stationId);

      stationsStore.assignPerson(stationId, choseSide(stationId), worker.id);
      workersStore.setWorkerHistory(worker.id,stationId);
      const indexT = stationsKeys.findIndex(e=>e === stationId);

      if(stations[stationId] === 1)stationsKeys.splice(indexT,1);
      if(stations[stationId] === 2 && stationsStore.assignments[stationId]?.left && stationsStore.assignments[stationId]?.right)stationsKeys.splice(indexT,1);
      break;

    }
  }


};
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
