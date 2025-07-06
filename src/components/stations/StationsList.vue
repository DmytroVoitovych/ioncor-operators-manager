<template>
  <el-card>
    <template #header>
      <div class="card-header"></div>
    </template>
    <ul class="stationsList">
      <li class="stationItem" v-for="(station, key) in store.getStations" :key="key">
        <el-select
          v-model="getStationSelect(key, LEFT_SIDE_KEY).value"
          :suffix-icon="Plus"
          class="stationButton --left dashed"
          v-if="+station === 2"
          placeholder="Assign to station"
        >
          <el-option
            v-for="person in availablePeople(key).value"
            :key="person.id"
            :label="`${person.name} ${person.surname}`"
            :value="person.id"
          />
        </el-select>
        <div class="stationInfo">
          <p class="stationName">
            <Location color="var(--neutral-300)" width="20" height="20" /> Station
            {{ key }}
          </p>
          <StationInfoContent
            :rightSide="getStationSelect(key, Right_SIDE_KEY).value"
            :leftSide="getStationSelect(key, LEFT_SIDE_KEY).value"
            :station="station"
          >
            {{ +station === 2 ? "operators" : "operator" }}
          </StationInfoContent>
        </div>
        <el-select
          v-model="getStationSelect(key, Right_SIDE_KEY).value"
          :suffix-icon="Plus"
          class="stationButton --right"
          placeholder="Assign to station"
          ><el-option
            v-for="person in availablePeople(key).value"
            :key="person.id"
            :label="`${person.name} ${person.surname}`"
            :value="person.id"
        /></el-select>
      </li>
    </ul>
    <template #footer>
      <ScheduleGeneration />
    </template>
  </el-card>
</template>

<script lang="ts" setup>
import { Location, Plus } from "@element-plus/icons-vue";
import { computed, onMounted } from "vue";
import { StationId } from "~/maintypes/types";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
import { SideKey } from "./types";

const LEFT_SIDE_KEY = "left";
const Right_SIDE_KEY = "right";

const operatorStore = useWorkersStore();
const store = useStationsStore();

const getStationSelect = (stationId: StationId, slotKey: SideKey) => {
  return computed({
    get: () => store.getAssignment(stationId, slotKey),
    set: (value: string) => {
      store.assignPerson(stationId, slotKey, value);
    },
  });
};

const availablePeople = (stationId: StationId) =>
  computed(() =>
    operatorStore.workers.filter(
      (worker) => worker.status === "available" && worker.known_stations.includes(stationId),
    ),
  );

onMounted(() => store.initializeStateFromWorkersStore());
</script>
<style lang="scss" scoped>
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
  }

  .stationButton.--right {
    grid-column: 3;
  }

  &:has(.stationButton:first-child) {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.stationInfo > * {
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
</style>
