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
          <el-radio
            :value="1"
            @click="
              () => {
                if (date) date = [];
              }
            "
            >Day</el-radio
          >
          <el-radio
            :value="9"
            @click="
              () => {
                if (date) date = [];
              }
            "
            >Week</el-radio
          >
        </el-radio-group>
        <div class="castomDateBlock">
          <span>Custom date period</span>
          <el-date-picker
            v-model="(date as [])"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            :disabled-date="(time:Date)=>time.getTime() < Date.now() - ONE_DAY"
            :editable="false"
            @change="
            (e: [Date, Date] | null) => {
                if (!e) return;
                const startDate = dayjs(e[0]);
                const endDate = dayjs(e[1]);
                console.log(endDate.diff(startDate, 'day'));
                period = endDate.diff(startDate, 'day') + 1;
              }
            "
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
          test(date?.[0]);
          console.timeEnd();
          // count = 0;
        }
      "
      >Generate Schedule</el-button
    >
  </section>
</template>

<script setup lang="ts">
import { computed, ref,toRaw,watch } from "vue";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
import { generateSchedule } from "./utils/scheduleGenerator";
import { dayjs } from "element-plus";
import { FIRST_LIST, ONE_DAY } from "./constants";
import { Operator } from "~/maintypes/types";

const workersStore = useWorkersStore();
const stationsStore = useStationsStore();

const availableWorkers = computed(() =>
  workersStore.workers
    .filter((worker) => worker.status === "available")
    .toSorted((a, b) => a.known_stations.length - b.known_stations.length),
);

const stations = stationsStore.getStations;

const absentAmount = computed(()=>
 Object.values(stations).reduce((acc,st)=>acc + st ,0) - availableWorkers.value.length
);


const timeRotation = ref(2);
const period = ref(1);
const date = ref<Date[]>([]);
const snapshotMap = new Map();

const disabledDate = (date: Date) => {
  const day = dayjs(date).day();
  return day === 0 || day === 6;
};

const interationsAmount = computed<number>(() => timeRotation.value * period.value);

const makeKey = (date: Date, rotation: number) => `${dayjs(date).format("YYYY-MM-DD")}_${rotation}`;

const rewriteHistory = (workers:Operator[],date:Date) =>{
const cycleDate = dayjs(date).format('YYYY-MM-DD');
workers.forEach(worker => {
    if(!worker.station_history?.length || worker.status !== 'available') return;
     worker.station_history =  worker.station_history
        ?.filter((entry) => !dayjs(entry.date).format('YYYY-MM-DD').includes(cycleDate))
        .toSorted((a, b) =>  dayjs(a.date).toDate().getTime() - dayjs(b.date).toDate().getTime() );
    });
};

const rewriteSnapshot =(date:Date)=>{
  const cycleDate = dayjs(date).format('YYYY-MM-DD');
   for (const [key] of stationsStore.getSnapshotMap) {
    
    if (key.startsWith(cycleDate)) delete stationsStore.snapshot[key];

}};

const test = (start?: Date) => {
  snapshotMap.clear();

  let num = 0;
  let date = start || new Date();

  for (let index = 0; index < interationsAmount.value; index++) {
    if(!num) {
    rewriteHistory(toRaw(workersStore.workers),date);
    rewriteSnapshot(date);
  }
    const copy = generateSchedule(stationsStore, availableWorkers.value, stationsStore.getStations,date);
    num++;

    if (!disabledDate(date as Date) || disabledDate(dayjs().toDate()))
      snapshotMap.set(makeKey(date as Date, num), copy);

    if (num === timeRotation.value) {
      num = 0;
      date = dayjs(date).add(1, "day").toDate();
    }
  }

  console.log(snapshotMap);
  const defaultDate = start || new Date();
  const defaultRotation = +FIRST_LIST.slice(-1);
  const defaultKey = makeKey(defaultDate, defaultRotation);

  stationsStore.snapshot = Object.assign(stationsStore.snapshot,Object.fromEntries(snapshotMap));
  stationsStore.replaceAssignments(defaultKey);
  workersStore.replaceWorkers(stationsStore.getSnapshotMap.get(defaultKey)!.snp_workers);
};

watch(absentAmount,(n)=>{
  if(stationsStore.stations["200"] === 1 && !n) stationsStore.stations.changeRequiredPeople("200",2);
  if(n) stationsStore.stations.changeRequiredPeople("200",1);
  console.log(stationsStore.getStations);
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
