<template>
  <el-button type="primary" plain size="small" @click="dialogTableVisible = !dialogTableVisible"
    >Edit</el-button
  >
  <el-dialog
    append-to-body
    v-model="dialogTableVisible"
    title="Edit Operator"
    width="800"
    :close-on-click-modal="false"
  >
    <el-form :model="formOperatorUpdate" label-width="auto" label-position="left">
      <el-form-item prop="name" label="Edit Name">
        <el-input v-model="formOperatorUpdate.name" :value="formOperatorUpdate.name" />
      </el-form-item>
      <el-form-item prop="surname" label="Edit Surname">
        <el-input v-model="formOperatorUpdate.surname" :value="formOperatorUpdate.surname" />
      </el-form-item>
      <el-form-item prop="known_stations" label="Known stations">
        <el-select
          v-model="formOperatorUpdate.known_stations"
          multiple
          placeholder="Select stations"
        >
          <template #header>
            <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll">
              All
            </el-checkbox>
          </template>

          <el-option
            v-for="station of STATIONS_LIST"
            :key="station"
            :label="station"
            :value="station"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="status" label="Status">
        <el-select v-model="formOperatorUpdate.status" placeholder="Select status">
          <el-option v-for="(data, key) in Status" :key="key" :label="data" :value="data" />
        </el-select>
      </el-form-item>
      <el-form-item prop="current_station" label="Current Station">
        <el-select
          v-model="formOperatorUpdate.current_station"
          placeholder="Select current station"
        >
          <el-option
            v-for="station of [...STATIONS_LIST, 'unassigned']"
            :key="station"
            :label="station"
            :value="station"
          />
        </el-select>
      </el-form-item>
      <el-button
        type="primary"
        @click="updateOperator"
        :disabled="!isChanged || loading"
        :loading="loading"
        >Save</el-button
      >
      <el-button @click="dialogTableVisible = false">Cancel</el-button>
    </el-form>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useWorkersStore } from "~/store/workers";
import { Operator, StationNumber, STATIONS, Status } from "~/maintypes/types";
import { computed, reactive, ref, watch } from "vue";
import { CheckboxValueType } from "element-plus";

const props = defineProps<{
  operatorId: string;
}>();

const store = useWorkersStore();
const dialogTableVisible = ref(false);

const { updateWorker } = store;

const operator = ref<Operator>({} as Operator);

const formOperatorUpdate = ref<
  Omit<Operator, "id" | "created_at" | "updated_at" | "role" | "station_history">
>({
  name: "",
  surname: "",
  known_stations: [],
  status: "available" as Status,
  current_station: "unassigned" as StationNumber,
});

const stationObject = reactive(STATIONS);
const checkAll = ref(false);
const indeterminate = ref(false);
const isChanged = ref(false);
const loading = ref(false);

const STATIONS_LIST = computed(() => {
  return Object.keys(stationObject).filter(
    (key) => typeof stationObject[key as keyof typeof stationObject] !== "function",
  );
});

const updateFormFromOperator = (operatorData: Operator) => {
  if (!operatorData || !operatorData.id) return;

  formOperatorUpdate.value = {
    name: operatorData.name || "",
    surname: operatorData.surname || "",
    known_stations: operatorData.known_stations || [],
    status: operatorData.status,
    current_station: operatorData.current_station,
  };
};

// watch(
//   () => props.operatorId,
//   (newId) => {
//     if (newId) {
//       operator.value = store.getWorkersById(newId) as Operator;
//       updateFormFromOperator(operator.value);
//     }
//   },
//   { immediate: true },
// );
// refactoring required!!!!
watch(dialogTableVisible, (n) => {
  if (!n) return;
  operator.value = store.getWorkersById(props.operatorId) as Operator;
  updateFormFromOperator(operator.value);
});

watch(
  operator,
  (newOperator) => {
    updateFormFromOperator(newOperator);
  },
  { deep: true },
);

const handaleLoading = (loadingState: boolean) => {
  loading.value = loadingState;
};

const updateOperator = () => {
  const updatedFields = {};
  if (!isChanged.value) return;

  for (const key in formOperatorUpdate.value) {
    const typedKey = key as keyof typeof formOperatorUpdate.value;

    if (formOperatorUpdate.value[typedKey] !== operator.value[typedKey]) {
      // @ts-expect-error: typedKey may not match all keys of updatedFields, but is safe here
      updatedFields[typedKey] = formOperatorUpdate.value[typedKey];
    }
  }

  updateWorker(
    updatedFields as Operator,
    props.operatorId,
    () => {
      dialogTableVisible.value = false;
      isChanged.value = false;
    },
    handaleLoading,
  );
};

watch(
  () => formOperatorUpdate.value,
  (newValue) => {
    if (!operator.value || !operator.value.id) return;

    const keys = Object.keys(newValue) as (keyof typeof newValue)[];
    isChanged.value = keys.some((key) => {
      const formValue = newValue[key];
      const operatorValue = operator.value[key];
      if (Array.isArray(formValue) && Array.isArray(operatorValue)) {
        return JSON.stringify([...formValue].sort()) !== JSON.stringify([...operatorValue].sort());
      }

      return formValue !== operatorValue;
    });
  },
  { deep: true },
);

watch(
  () => formOperatorUpdate.value.known_stations,
  (val: StationNumber[]) => {
    if (val.length === 0) {
      checkAll.value = false;
      indeterminate.value = false;
    } else if (val.length === STATIONS_LIST.value.length) {
      checkAll.value = true;
      indeterminate.value = false;
    } else {
      indeterminate.value = true;
    }
  },
);

const handleCheckAll = (val: CheckboxValueType) => {
  indeterminate.value = false;
  if (val) {
    formOperatorUpdate.value.known_stations = STATIONS_LIST.value as StationNumber[];
  } else {
    formOperatorUpdate.value.known_stations = [];
  }
};
</script>
