<template>
  <section class="scheduleGeneration">
    <ScheduleAbsentInfo :operatorsAmount="availableWorkers.length" :absentAmount :stationsAmount />
    <div class="scheduleHeadlineBlock">
      <h3>Schedule Generation</h3>
      <slot></slot>
    </div>
    <el-form label-position="top">
      <el-form-item label="Rotation settings">
        <el-radio-group v-model="timeRotation">
          <el-radio :value="4">Every two hours</el-radio>
          <el-radio :value="2">Every four hours</el-radio>
          <el-radio :value="1">full day</el-radio>
        </el-radio-group></el-form-item>
      <el-form-item label="Period Selection">
        <el-radio-group v-model="period">
          <el-radio :value="1" @click="() => { if (date) date = []; }">Day</el-radio>
          <el-radio :value="9" @click="() => { if (date) date = []; }">Week</el-radio>
        </el-radio-group>
        <div class="castomDateBlock">
          <span>Custom date period</span>
          <el-date-picker v-model="date" type="daterange" range-separator="To" start-placeholder="Start date"
            end-placeholder="End date" :disabled-date="(time: Date) => time.getTime() < Date.now() - ONE_DAY"
            :editable="false" @change="handleDateRangeChange" />
        </div>
      </el-form-item>
    </el-form>
    <div class="scheduleButtonBlock">
      <el-button v-loading="perfomanceLoader" :disabled="perfomanceLoader" ref="btn" size="large" class="scheduleButton"
        type="primary" @click="
          runScheduleGenerator(date?.[0] || headerDate, interationsAmount);
        ">{{ perfomanceLoader ? 'Generating is going...' : 'Generate Schedule' }}</el-button>
      <el-button v-if="!stationsStore.isApproved" @click="() => {
        stationsStore.saveNewSnapshot();
        stationsStore.switchApprovmentFlag(true);
      }" size="large" type="success">
        Save data in DB
      </el-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, ref, toRaw, watch } from "vue";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
import { generateSchedule } from "./utils/scheduleGenerator";
import { dayjs } from "element-plus";
import { FIRST_LIST, ONE_DAY } from "./constants";
import { Operator } from "~/maintypes/types";
import { useTimeoutFn } from "@vueuse/core";
import shuffle from "lodash.shuffle";

const workersStore = useWorkersStore();
const stationsStore = useStationsStore();

const perfomanceLoader = ref(false);

defineProps<{ headerDate: string }>();

const availableWorkers = computed(() =>
  shuffle(workersStore.workers
    .filter((worker) => worker.status === "available"))
    .toSorted((a, b) => a.known_stations.length - b.known_stations.length),
);

const stations = stationsStore.getStations;

const stationsAmount = computed(() => Object.values(stations).reduce((acc, st) => acc + st, 0));

const absentAmount = computed(
  () => stationsAmount.value - availableWorkers.value.length,
);


const timeRotation = ref(2);
const period = ref(1);
const date = ref([]);
const snapshotMap = new Map();

const disabledDate = (date: Date) => {
  const day = dayjs(date).day();
  return day === 0 || day === 6;
};

const interationsAmount = computed<number>(() => timeRotation.value * period.value);

const makeKey = (date: Date, rotation: number) => `${dayjs(date).format("YYYY-MM-DD")}_${rotation}`;

const rewriteHistory = (workers: Operator[], date: Date) => {
  const cycleDate = dayjs(date).format("YYYY-MM-DD");

  workers.forEach((worker) => {
    if (!worker.station_history?.length || worker.status !== "available") return;
    worker.station_history = worker.station_history
      ?.filter((entry) => dayjs(entry.date).isBefore(cycleDate))
      .toSorted((a, b) => dayjs(a.date).toDate().getTime() - dayjs(b.date).toDate().getTime());
  });
};

const rewriteSnapshot = (date: Date) => {
  const cycleDate = dayjs(date).format("YYYY-MM-DD");
  for (const [key] of stationsStore.getSnapshotMap) {

    if (key.startsWith(cycleDate)) delete stationsStore.snapshot[key];
  }
};

const handleDateRangeChange = (e: [Date, Date] | null) => {
  if (!e) return;
  const startDate = dayjs(e[0]);
  const endDate = dayjs(e[1]);

  period.value = endDate.diff(startDate, 'day') + 1;
};

const isTodayWeekend = () => {
  const day = dayjs().day();
  return day === 0 || day === 6;
};


const runScheduleGenerator = (start?: Date, amount: number = 1) => {
  perfomanceLoader.value = true;

  useTimeoutFn(() => {
    snapshotMap.clear();

    let num = 0;
    let date = start || new Date();

    for (let index = 0; index < amount; index++) {

      if (disabledDate(date as Date) && !isTodayWeekend()) { date = dayjs(date).add(1, "day").toDate(); continue };

      if (!num) {
        rewriteHistory(toRaw(workersStore.workers), date);
        rewriteSnapshot(date);
      }
      const copy = generateSchedule(
        stationsStore,
        availableWorkers.value,
        stationsStore.getStations,
        date,
      );
      num++;

      if (!disabledDate(date as Date) || isTodayWeekend()) {
        snapshotMap.set(makeKey(date as Date, num), copy);
      }
      if (num === timeRotation.value) {
        num = 0;
        date = dayjs(date).add(1, "day").toDate();
      }
    }

    const defaultDate = start || new Date();
    const defaultRotation = +FIRST_LIST.slice(-1);
    const defaultKey = makeKey(defaultDate, defaultRotation);

    stationsStore.snapshot = Object.assign(markRaw(stationsStore?.snapshot || {}), Object.fromEntries(snapshotMap));
    stationsStore.replaceAssignments(defaultKey);
    workersStore.replaceWorkers(defaultKey);
    stationsStore.triggerSnapshot();
    stationsStore.updateFutureStationHistory(date, timeRotation.value, makeKey);
    stationsStore.switchApprovmentFlag(false);
    perfomanceLoader.value = false;
  }, 0);
};

watch(
  absentAmount,
  (n) => {

    if (stationsStore.stations["200"] === 1 && (!n))
      stationsStore.stations.changeRequiredPeople("200", 2);
    if (n) stationsStore.stations.changeRequiredPeople("200", 1);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (stationsStore.stations["200"] === 1)
    stationsStore.stations.changeRequiredPeople("200", 2);
});

</script>

<style scoped lang="scss">
.scheduleHeadlineBlock {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  align-items: center;
  @include fluid-desktop-font(16px, 19px);
}


.el-form {
  --el-form-label-font-size:#{fluid-font(16px, 19px, 1440px, 2560px)};
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
    --el-radio-font-size:#{fluid-font(14px, 17px, 1440px, 2560px)};
    align-self: start;

  }
}

.castomDateBlock {
  @include fluid-desktop-font(14px, 17px);

  span {
    display: block;
  }
}

.scheduleButtonBlock {
  display: flex;
  justify-content: center;
}

.scheduleButton {
  flex-grow: 1;
  align-self: center;

}

:deep(.el-loading-mask) {
  mix-blend-mode: multiply;
}

.el-button.is-disabled {
  --el-button-text-color: var(--neutral-900);
}

.el-button {
  @include fluid-desktop-font(14px, 17px);
}

:deep(.el-date-editor) {
  @include mq(mobile-large) {
    translate: -40px 0;
  }

  @include mq(mobile) {
    translate: -90px 0;
  }
}

:deep(.el-date-editor--daterange) {
  @include mq(tablet-small) {
    --el-date-editor-width: 220px;
  }

}
</style>
