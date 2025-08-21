<template>
  <el-button plain style="width: 100%" @click="dialogFormVisible = true">
    Add New Operator
  </el-button>
  <el-dialog
    class="dialog__creation"
    v-model="dialogFormVisible"
    title="Add new operator"
    :width="isSmallTablet ? '100%' : '500'"
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
        <el-button
          type="primary"
          @click="$emit('addOperator', handleClose)"
          :disabled="isEmpty || loading"
          :loading="loading"
        >
          Add Operator
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { templateRef, useMediaQuery } from "@vueuse/core";
import { CheckboxValueType, FormInstance } from "element-plus";
import { watch } from "vue";
import { computed, ref } from "vue";
import { StationNumber, UserCreationData, Status } from "~/maintypes/types";
import { useStationsStore } from "~/store/stations";

defineProps<{
  loading: boolean;
}>();

const isSmallTablet = useMediaQuery("(max-width: 600px)");

const stationStore = useStationsStore();

const formRef = templateRef<FormInstance>("formRef");

const dialogFormVisible = ref(false);
const checkAll = ref(false);
const indeterminate = ref(false);

const STATIONS_LIST = computed(() => {
  return Object.keys(stationStore.getStations);
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

<style lang="scss">
.el-dialog {
  @include mq(tablet) {
    --el-dialog-width: calc(100% - 40px);
  }

  @include mq(desktop-large) {
    scale: 2;
  }

  @include mq(desktop) {
    scale: 1.3;
  }

  @include mq(laptop-large) {
    scale: 1;
  }

  @include mq(laptop) {
    scale: 0.9;
  }
}

.el-dialog.dialog__creation {
  --el-dialog-content-font-size: #{fluid-font(14px, 17px, 1440px, 2560px)};
  --el-dialog-title-font-size: #{fluid-font(18px, 24px, 1440px, 2560px)};
  display: grid;
  row-gap: 16px;
}

.el-form {
  --el-form-label-font-size: #{fluid-font(14px, 17px, 1440px, 2560px)};
}

.el-select {
  --el-select-input-font-size: #{fluid-font(14px, 17px, 1440px, 2560px)};
}
</style>
