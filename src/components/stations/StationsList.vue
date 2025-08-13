<template>
  <el-card shadow="never">
    <template #header>
      <StationHeader v-model:now="now" />
    </template>
    <ul class="stationsList" ref="screenshotArea">
      <li class="stationItem" v-for="(station, key) in store.getStations" :key="key">
        <div class="selectBlock">
          <el-select clearable @clear="clearSelectValue(key, LEFT_SIDE_KEY, getStationSelect(key, LEFT_SIDE_KEY).value)"
            v-model="getStationSelect(key, LEFT_SIDE_KEY).value" :suffix-icon="Plus" class="stationButton --left dashed"
            v-if="+station === 2" placeholder="Assign to station">
            <el-option v-for="person in availablePeople(key).value" :key="person.id"
              :label="`${person.name} ${person.surname}`" :value="person.id">
              {{ getSpecialMark(person, getStationSelect(key, LEFT_SIDE_KEY).value, key, `${person.name}
              ${person.surname}`) }}
            </el-option>
          </el-select>
          <ButtonClear v-if="getStationSelect(key, LEFT_SIDE_KEY).value"
            @click="clearSelectValue(key, LEFT_SIDE_KEY, getStationSelect(key, LEFT_SIDE_KEY).value)" />
        </div>
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
        <div class="selectBlock">
          <el-select clearable
            @clear="clearSelectValue(key, Right_SIDE_KEY, getStationSelect(key, Right_SIDE_KEY).value)"
            v-model="getStationSelect(key, Right_SIDE_KEY).value" :suffix-icon="Plus" class="stationButton --right"
            placeholder="Assign to station" @change="console.log($event, 'teee')"><el-option
              v-for="person in availablePeople(key).value" :key="person.id" :label="`${person.name} ${person.surname}`"
              :value="person.id">
              {{ getSpecialMark(person, getStationSelect(key, Right_SIDE_KEY).value, key, `${person.name}
              ${person.surname}`) }}
            </el-option></el-select>
          <ButtonClear v-if="getStationSelect(key, Right_SIDE_KEY).value"
            @click="clearSelectValue(key, Right_SIDE_KEY, getStationSelect(key, Right_SIDE_KEY).value)" />
        </div>
      </li>
    </ul>
    <template #footer>
      <ScheduleGeneration :headerDate="now">
        <ButtonMakeScreen v-if="availablePeople?.length > (availablePeople?.length / 2)"
          @click="screenRef?.captureAndDownload(screenshotArea, operatorStore.globalKey)" ref="screenRef" />
      </ScheduleGeneration>
    </template>
  </el-card>
</template>

<script lang="ts" setup>
import { Location, Plus } from "@element-plus/icons-vue";
import { computed, ref, useTemplateRef } from "vue";
import { Operator, StationId } from "~/maintypes/types";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
import { SideKey } from "./types";
import { dayjs } from "element-plus";
import { findWorkerById } from "./utils/workerUtils";
import { templateRef } from "@vueuse/core";
import ButtonMakeScreen from "./ButtonMakeScreen.vue";


const LEFT_SIDE_KEY = "left";
const Right_SIDE_KEY = "right";

const operatorStore = useWorkersStore();
const store = useStationsStore();
const now = ref(dayjs().format("YYYY-MM-DD"));
const screenshotArea = templateRef('screenshotArea');
const screenRef = useTemplateRef<InstanceType<typeof ButtonMakeScreen>>('screenRef');


const getStationSelect = (stationId: StationId, slotKey: SideKey) => {
  return computed({
    get: () => store.getAssignment(stationId, slotKey),
    set: (personId: string) => {
      if (personId) store.executeWorkerAssignment(stationId, slotKey, personId, now.value)
    },
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

    const personFromMaxSlots = store.snapshot?.[now.value + `_${store.getMaxSlot}`]?.snp_workers.find(
      (p) => p.id === person.id,
    );
    const isLengthAcceptable = person.known_stations.length > 4;
    const isPersonAttend = personFromMaxSlots?.visited_stations?.slice(-4)?.includes(station) || person?.visited_stations?.slice(-4)?.includes(station);
    const isAnotherPerson = person.current_station !== station;
    const isMarkMandatory = isLengthAcceptable && isPersonAttend && isAnotherPerson;

    return isMarkMandatory ? label + ' 🕒' : label;

  });

const reverseSwapMark = (person: Operator, currentPerson: Operator | 'Extra' | '', station: StationId) =>
  computed(() => {

    const isAnotherPerson = person.current_station !== station;
    const isSuitablePerson = !!currentPerson && currentPerson !== 'Extra' && person.current_station !== 'unassigned' as StationId;
    const isMarkMandatory = isAnotherPerson && isSuitablePerson && currentPerson?.known_stations.includes(person.current_station);

    return isMarkMandatory ? ' 👥🔄  ' + person.current_station : '';

  });

const getSpecialMark = (person: Operator, currentPersonId: string | 'Extra' | '', station: StationId, label: string) =>
  computed(() =>
    recentlyVisitedMark(person, label, station).value
    +
    reverseSwapMark(person, findWorkerById(operatorStore.workers, currentPersonId) || '', station).value)
  ;

const clearSelectValue = (stationId: StationId, slotKey: SideKey, personId: string) => {
  if (store.getSnapshotMap.has(operatorStore.globalKey)) {

  if (personId !== 'Extra') store.executeWorkerAssignment('unassigned' as StationId, slotKey, personId, now.value);
  else store.enable_extra = false;

  }
  else store.unassignPerson(stationId, slotKey, personId);
};

</script>
<style lang="scss" scoped>
.el-card {
  --el-card-border-color: var(--blue-100);

  border-radius: 12px;
  border: 2px solid var(--blue-100);
  border-top-left-radius: 0;

}

.selectBlock {
  width: 100%;
  position: relative;
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
