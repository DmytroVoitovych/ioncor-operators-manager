<template>
  <el-card shadow="never">
    <template #header>
      <StationHeader v-model:now="now" />
    </template>

    <ul class="stationsList">
      <li class="stationItem" v-for="(station, key) in store.getStations" :key="key">
        <el-select clearable @clear="clearSelectValue(key,LEFT_SIDE_KEY,getStationSelect(key,LEFT_SIDE_KEY).value)" v-model="getStationSelect(key, LEFT_SIDE_KEY).value" :suffix-icon="Plus"
          class="stationButton --left dashed" v-if="+station === 2" placeholder="Assign to station">
          <el-option v-for="person in availablePeople(key).value" :key="person.id"
            :label="`${person.name} ${person.surname}`" :value="person.id">
            {{ recentlyVisitedMark(person, `${person.name} ${person.surname}`, key) }}
          </el-option>
        </el-select>
        <div class="stationInfo">
          <p class="stationName">
            <Location color="var(--neutral-300)" width="20" height="20" /> Station
            {{ key }}
          </p>
          <StationInfoContent :rightSide="getStationSelect(key, Right_SIDE_KEY).value"
            :leftSide="getStationSelect(key, LEFT_SIDE_KEY).value" :station="station">
            {{ +station === 2 ? "operators" : "operator" }}
          </StationInfoContent>
        </div>
        <el-select clearable @clear="clearSelectValue(key,Right_SIDE_KEY,getStationSelect(key, Right_SIDE_KEY).value)" v-model="getStationSelect(key, Right_SIDE_KEY).value" :suffix-icon="Plus"
          class="stationButton --right" placeholder="Assign to station" @change="console.log($event, 'teee')"><el-option
            v-for="person in availablePeople(key).value" :key="person.id" :label="`${person.name} ${person.surname}`"
            :value="person.id">
            {{ recentlyVisitedMark(person, `${person.name} ${person.surname}`, key) }}
          </el-option></el-select>
      </li>
    </ul>
    <template #footer>
      <ScheduleGeneration :headerDate="now" />
    </template>
  </el-card>
</template>

<script lang="ts" setup>
import { Location, Plus } from "@element-plus/icons-vue";
import { computed, onMounted, ref } from "vue";
import { Operator, StationId } from "~/maintypes/types";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
import { SideKey } from "./types";
import { dayjs } from "element-plus";

const LEFT_SIDE_KEY = "left";
const Right_SIDE_KEY = "right";

const operatorStore = useWorkersStore();
const store = useStationsStore();
const now = ref(dayjs().format("YYYY-MM-DD"));

const getStationSelect = (stationId: StationId, slotKey: SideKey) => {
  return computed({
    get: () => store.getAssignment(stationId, slotKey),
    set: (personId: string) =>{
      console.log(personId,'test');
     if(personId)store.executeWorkerAssignment(stationId, slotKey, personId, now.value)},
  });
};

const availablePeople = (stationId: StationId) =>
  computed(() =>
    operatorStore.workers.filter(
      (worker) => worker.status === "available" && worker.known_stations.includes(stationId),
    ),
  );

const recentlyVisitedMark = (person: Operator, label: string, station: StationId) =>
  computed(() => {
    const isLengthAcceptable = person.known_stations.length > 4;
    const isPersonAttend = person?.visited_stations?.slice(-4)?.includes(station);
    const isAnotherPerson = person.current_station !== station;
    const isMarkMandatory = isLengthAcceptable && isPersonAttend && isAnotherPerson;

    return isMarkMandatory ? label + ' 🕒' : label;

  });

  const clearSelectValue = (stationId:StationId,slotKey:SideKey,personId:string)=>{
  store.unassignPerson(stationId,slotKey,personId);
  };

onMounted(() => store.initializeStateFromWorkersStore());
</script>
<style lang="scss" scoped>
.el-card {
  --el-card-border-color: var(--blue-100);

  border-radius: 12px;
  border: 2px solid var(--blue-100);
  border-top-left-radius: 0;

}


.stationsList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stationItem {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  place-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--blue-100);
  border-radius: 8px;

  .stationInfo {
    grid-column: 2;
    text-align: center;

    &>.stationName {
      font-weight: 600;
      color: var(--neutral-900);
    }
  }


  .stationButton.--right {
    grid-column: 3;
  }

  &:has(.stationButton:first-child) {
    grid-template-columns: 1fr 1fr 1fr;
  }

  &:has(.assigned) {
    border: 1px solid var(--el-color-success);

    .el-select {
      --el-border-color: var(--el-color-success-light-3);
      --el-fill-color-blank: var(--el-color-success-light-9);
    }
  }

  &:has(.partialy) {
    border: 1px solid var(--el-color-warning);

    .el-select {
      --el-border-color: var(--el-color-warning-light-3);
      --el-fill-color-blank: var(--el-color-warning-light-9);
    }
  }
}

.stationInfo>* {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.el-select {
  :deep(.el-select__wrapper) {
    flex-direction: row-reverse;
    gap: 16px;
    box-shadow: none;
    border: 2px dashed var(--el-border-color);
  }
}

/* .assigned{
border-color: var(--el-color-success-light-5);
} */
</style>
