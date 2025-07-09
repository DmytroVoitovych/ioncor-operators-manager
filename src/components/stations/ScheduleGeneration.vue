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
import { computed, ref, toRaw, toRef, toRefs } from "vue";
import { Operator, StationNumber, STATIONS } from "~/maintypes/types";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
import { SideKey } from "./types";
import shuffle from "lodash.shuffle";
import { de } from "element-plus/es/locales.mjs";
import { c } from "node_modules/vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";

const workersStore = useWorkersStore();
const stationsStore = useStationsStore();

const availableWorkers = computed(() =>
  workersStore.workers
    .filter((worker) => worker.status === "available")
    .toSorted((a, b) => a.known_stations.length - b.known_stations.length),
);
const stations = stationsStore.getStations;

const radio = ref(2);
const period = ref("1");
const date = ref("");

const generateSchedule = () => {
  stationsStore.assignments = {};
  availableWorkers.value.forEach((worker) => (worker.current_station = "unassigned"));
  const stationsKeys: StationNumber[] = shuffle(Object.keys(stations) as StationNumber[]);

  const choseSide = (checkStation: StationNumber) => {
    if (stations[checkStation] && stations[checkStation] === 2) {
      return stationsStore.assignments[checkStation]?.left ? "right" : "left";
    }

    return "right";
  };

  const getPossibleStations = (worker: Operator) =>
    shuffle(worker.known_stations.filter((e) => !worker.visited_stations?.includes(e)));

  const removePersonFromStation = (personId: string, stationId: StationNumber) => {
    stationsStore.removePerson(personId);
    workersStore.removeVisitedStation(personId, stationId);
  };

  const getSuitableWorkersForReplacement = (
    availableWorkers: Operator[],
    stationId: StationNumber,
    possibleStations: StationNumber[],
    id: string,
  ) => {
    const workersWhoKnowBothStations = availableWorkers.filter(
      (e) =>
        e.known_stations.includes(stationId) && //if worker knows the station
        e.known_stations.some((s) => possibleStations.includes(s)) &&
        e.id !== id, //if worker knows one of the possible stations and is not the current worker
    );

    const idealWorker = workersWhoKnowBothStations.find(
      (e) =>
        possibleStations.includes(e.current_station) && //if worker is at a possible station
        !e.visited_stations?.includes(stationId), //if worker has not visited the station yet
    );

     return idealWorker;

  };

  const findWorkerAsLastResort = (
     worker: Operator,
      stationId: StationNumber,
      availableWorkers: Operator[],
      possibleStations: StationNumber[],
  )=>{
    const workerVSt = worker.visited_stations;
    const giveNotLastVisited = (e:StationNumber) => e !== workerVSt.at(-1);

    const preventRepeat = shuffle(workerVSt.filter(giveNotLastVisited));

          const giveStaions = preventRepeat.length
            ? preventRepeat
            : shuffle(worker.known_stations.filter(giveNotLastVisited));

          possibleStations.splice(0, possibleStations.length);
          possibleStations.push(...giveStaions);

          const checkStForPossibleAndKnown = (e: Operator) =>
            e.known_stations.includes(stationId) &&
            possibleStations.includes(e.current_station);

          const newReplaceWith =
            availableWorkers.find(
              (e) =>
                checkStForPossibleAndKnown(e) &&
                !e.visited_stations?.includes(stationId),
            ) ||
            availableWorkers
              .filter(checkStForPossibleAndKnown)
              .toSorted(
                (a, b) =>
                  a.station_history.filter(e=>e.station === stationId).length
                  - b.station_history.filter(e=>e.station === stationId).length,
              )[0];

              return newReplaceWith;
  };

  const  assignWorkerToStation = (workerId:string, targetStation:StationNumber,side:SideKey)=> {
  stationsStore.assignPerson(
    targetStation,
    side,
    workerId,
  );
  workersStore.setWorkerHistory(workerId, targetStation);
};

const  removeStationIfFull = (stationId:StationNumber, sts:typeof stations, stationsKeys:StationNumber[])=> {
  const indexT = stationsKeys.findIndex((e) => e === stationId);

  const checkSideAssignment = sts[stationId] === 2 && stationsStore.assignments[stationId]?.left &&
    stationsStore.assignments[stationId]?.right

  if (sts[stationId] === 1) stationsKeys.splice(indexT, 1);
  if (checkSideAssignment) stationsKeys.splice(indexT, 1);
}


  for (let index = 0; index < availableWorkers.value.length; index++) {
    for (let i = 0; i < stationsKeys.length; i++) {
      const stationId: StationNumber = stationsKeys[i];
      const worker = availableWorkers.value[index];
      const isAssigned = stationsStore.getAssignment(
        stationId,
        choseSide(stationsStore.assignments[stationId]),
      );
      const isKnown = worker.known_stations.includes(stationId as StationNumber);

      if (i === stationsKeys.length - 1 && !isKnown) {
        const possibleStations = getPossibleStations(worker);
        const replaceWith = getSuitableWorkersForReplacement(
          availableWorkers.value,
          stationId,
          possibleStations,
          worker.id,
        );

        if (!replaceWith) {
        const newReplaceWith = findWorkerAsLastResort(worker, stationId, availableWorkers.value, possibleStations);

          if (!newReplaceWith) {
          generateSchedule();
          return;
          }

          removePersonFromStation(newReplaceWith?.id, stationId);
          assignWorkerToStation(worker.id, newReplaceWith.current_station, choseSide(newReplaceWith.current_station));
          assignWorkerToStation(newReplaceWith.id, stationId, choseSide(stationId));
          removeStationIfFull(stationId, stations, stationsKeys);
          break;
        }

        removePersonFromStation(replaceWith?.id, stationId);
        assignWorkerToStation(worker.id, replaceWith.current_station, choseSide(replaceWith.current_station));
        assignWorkerToStation(replaceWith.id, stationId, choseSide(stationId));
        removeStationIfFull(stationId, stations, stationsKeys);
        break;
      }

      if (!isKnown) continue;

      if (worker.visited_stations?.includes(stationId) && i === stationsKeys.length - 1) {
        const possibleStations = getPossibleStations(worker);

        const replaceWith = getSuitableWorkersForReplacement(
          availableWorkers.value,
          stationId,
          possibleStations,
          worker.id,
        );

       if (!replaceWith) {
          const newReplaceWith = findWorkerAsLastResort(worker, stationId, availableWorkers.value, possibleStations);

          if (!newReplaceWith) {
            generateSchedule();
            return;
          }

          removePersonFromStation(newReplaceWith?.id, stationId);
          assignWorkerToStation(worker.id, newReplaceWith.current_station, choseSide(newReplaceWith.current_station));
          assignWorkerToStation(newReplaceWith.id, stationId, choseSide(stationId));
          removeStationIfFull(stationId, stations, stationsKeys);
          break;
        }

        removePersonFromStation(replaceWith?.id, stationId);
        assignWorkerToStation(worker.id, replaceWith.current_station, choseSide(replaceWith.current_station));
        assignWorkerToStation(replaceWith.id, stationId, choseSide(stationId));
        removeStationIfFull(stationId, stations, stationsKeys);
        break;
      }

      if (worker.visited_stations?.includes(stationId)) continue;

      assignWorkerToStation(worker.id, stationId, choseSide(stationId));
      removeStationIfFull(stationId, stations, stationsKeys);
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
