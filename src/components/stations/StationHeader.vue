<template>
  <div class="card-header">
    <h2 class="text-preset-6">Generated schedule for <span class="text-preset-6-mono">{{ now }}</span></h2>
    <el-date-picker v-model="now" type="date" placeholder="Pick a day" value-format="YYYY-MM-DD" :clearable="false"
      :editable="false" :disabled-date="setDisabledDate" />
    <h2 v-show="options.length" class="text-preset-6">Shift time slot segments:</h2>
    <el-segmented :key="segmentedKey" aria-label="Shift segments" v-model="timeSlot" :options="options" :props="props" />
  </div>
</template>

<script lang="ts" setup>
import { dayjs } from "element-plus";
import { storeToRefs } from "pinia";
import { computed,onMounted,  ref, watch } from "vue";
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

const segmentedKey = ref(0);

const options = computed(() => {
  if (!getSnapshotMap.value.size || getSnapshotMap.value.size === 1) return [];
  return getSnapshotMap.value.keys().reduce((acc: Record<string, string>[], key: string) => {
    const optObj = { period: `${key.at(-1)} time slot `, map_key: key };

    if (key.includes(now.value)) acc.push(optObj);
    return acc;
  }, []);
});

const setDisabledDate = (time: Date) => {
  const formatedDate = dayjs(time).format("YYYY-MM-DD");
  const isDateAllowed = time.getTime() < Date.now() - (ONE_DAY * 2);
  const today = formatedDate === dayjs().format("YYYY-MM-DD");
  if(today) return;

  return (
    (isDateAllowed ||
      (!getSnapshotMap.value.keys()?.some((key) => key.includes(formatedDate))))
  );
};

const timeSlot = ref<string | undefined>(now.value + FIRST_LIST);
const key = computed(() => now.value + (timeSlot.value?.slice(-2) || FIRST_LIST));

watch([timeSlot, now], () => {

  if (!getSnapshotMap.value.has(key.value)){
    workerStore.getWorkers().finally(()=> stationStore.getFreshSnapShots(key.value)); return;
  };
  timeSlot.value = key.value;

  workerStore.replaceWorkers(getSnapshotMap.value.get(key.value)!.snp_workers);
  stationStore.replaceAssignments(key.value);
});

watch(now,(n,o)=>{
 if(n === o) return;
 timeSlot.value = now.value + FIRST_LIST;
});

watch(
  key,
  (n) => {
    workerStore.setGlobalKey(n);
    },
  { immediate: true },
);


onMounted(() => {
stationStore.getFreshSnapShots(key.value);
});

watch(options, (newOptions) => {
  if (newOptions.length === 0) return;

  const currentExists = newOptions.some(option => option.map_key === timeSlot.value);

  if (!currentExists) timeSlot.value = newOptions[0]?.map_key;
  segmentedKey.value++;
}, { flush: 'post' });
</script>

<style scoped lang="scss">
.card-header {
  padding: 12px;
  border: 1px solid var(--blue-100);
  border-radius: 8px;
  background-color: var(--el-color-primary-light-9);
  display: grid;
  gap: 4px;

}
</style>
