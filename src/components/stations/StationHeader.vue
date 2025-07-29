<template>
  <div class="card-header">
    <h2 class="text-preset-6">Generated schedule for {{ now }}</h2>
    <el-date-picker
      v-model="now"
      type="date"
      placeholder="Pick a day"
      value-format="YYYY-MM-DD"
      :disabled-date="setDisabledDate"
    />
    <h2 v-show="options.length" class="text-preset-6">Shift time slot segments:</h2>
    <el-segmented
      aria-label="Shift segments"
      v-model="timeSlot"
      :options="options"
      :props="props"
    />
  </div>
</template>

<script lang="ts" setup>
import { dayjs } from "element-plus";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
import { FIRST_LIST, ONE_DAY } from "./constants";

const stationStore = useStationsStore();
const workerStore = useWorkersStore();
const now = defineModel("now", { default: dayjs().format("YYYY-MM-DD") });

const { getSnapshotMap } = storeToRefs(stationStore);

const props = {
  label: "period",
  value: "map_key",
};

const options = computed(() => {
  if (!getSnapshotMap.value.size || getSnapshotMap.value.size === 1) return [];
  return getSnapshotMap.value.keys().reduce((acc: Record<string, string>[], key: string) => {
    const optObj = { period: `${key.at(-1)} time slot `, map_key: key };

    if (key.includes(now.value)) acc.push(optObj);
    return acc;
  }, []);
});

const setDisabledDate = (time: Date) => {
  return (
    time.getTime() < Date.now() - ONE_DAY ||
    !getSnapshotMap.value.keys().find((key) => key.includes(dayjs(time).format("YYYY-MM-DD")))
  );
};

const timeSlot = ref<string | undefined>(now.value + FIRST_LIST);
const key = computed(() => now.value + (timeSlot.value?.slice(-2) || FIRST_LIST));

watch([timeSlot, now], () => {
  if (!getSnapshotMap.value.has(key.value)) return;
  timeSlot.value = key.value;
  workerStore.replaceWorkers(getSnapshotMap.value.get(key.value)!.snp_workers);
  stationStore.replaceAssignments(key.value);
});

watch(key,(n)=>{
workerStore.setGlobalKey(n);
},{immediate:true});

</script>
