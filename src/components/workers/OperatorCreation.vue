<template>
  <el-button plain style="width: 100%" @click="dialogFormVisible = true">
    Add New Operator
  </el-button>
  <el-dialog
    class="dialog__creation"
    v-model="dialogFormVisible"
    title="Add new operator"
    width="500"
    @closed="formRef.resetFields()"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" label-width="auto" label-position="left">
      <el-form-item prop="name" label="Operator name" required>
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item prop="surname" label="Operator surname" required>
        <el-input v-model="form.surname" autocomplete="off" />
      </el-form-item>
      <el-form-item prop="known_stations" label="Known stations" required>
        <el-select v-model="form.known_stations" multiple placeholder="Select stations">
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
      <el-form-item prop="status" label="Status" required>
        <el-select v-model="form.status" placeholder="Select status">
          <el-option v-for="(data, key) in Status" :key="key" :label="data" :value="data" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="$emit('addOperator', handleClose)" :disabled="isEmpty">
          Add Operator
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { templateRef } from "@vueuse/core";
import { CheckboxValueType, FormInstance } from "element-plus";
import { watch } from "vue";
import { computed, reactive, ref } from "vue";
import { StationNumber, STATIONS, UserCreationData, Status } from "~/maintypes/types";

const formRef = templateRef<FormInstance>("formRef");

const stationObject = reactive(STATIONS);
const dialogFormVisible = ref(false);
const checkAll = ref(false);
const indeterminate = ref(false);

const STATIONS_LIST = computed(() => {
  return Object.keys(stationObject).filter(
    (key) => typeof stationObject[key as keyof typeof stationObject] !== "function",
  );
});

const handleClose = () => {
  dialogFormVisible.value = false;
};

const form = defineModel<UserCreationData>("form", {
  default: () => ({
    name: "",
    surname: "",
    known_stations: [],
    status: "available",
  }),
});

const isEmpty = computed(() => {
  return (
    !form.value.name.trim() || !form.value.surname.trim() || form.value.known_stations.length === 0
  );
});

watch(
  () => form.value.known_stations,
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
    form.value.known_stations = STATIONS_LIST.value as StationNumber[];
  } else {
    form.value.known_stations = [];
  }
};

defineEmits<{
  (e: "addOperator", value: () => void): void;
}>();
</script>

<style>
.el-dialog.dialog__creation {
  display: grid;
  row-gap: 16px;
}
</style>
