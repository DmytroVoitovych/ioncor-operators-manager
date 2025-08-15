<template>
  <div class="tableButtonBlock">
    <OperatorCreation
      v-model:form="newOperatorData"
      @add-operator="(callback: () => void) => addWorker(newOperatorData, callback, loadingHandler)"
      :loading="loading"
    />
    <el-popconfirm
      confirm-button-text="Yes"
      cancel-button-text="No"
      :icon="InfoFilled"
      icon-color="var(--blue-600)"
      title="Are you sure to delete these selected operators?"
      @confirm="deleteSelectedWorkers(multipleSelection, deleteLoadingHandler)"
      width="300"
    >
      <template #reference>
        <el-button
          :disabled="!multipleSelection.length"
          type="danger"
          plain
          style="width: 100%"
          :loading="deleteLoading"
        >
          Delete selected Operators
        </el-button>
      </template>
    </el-popconfirm>
  </div>
</template>

<script lang="ts" setup>
import { InfoFilled } from "@element-plus/icons-vue";
import { ref } from "vue";
import { Status, UserCreationData } from "~/maintypes/types";
import { useWorkersStore } from "~/store/workers";

const store = useWorkersStore();
const { deleteSelectedWorkers, addWorker } = store;
const loading = ref(false);
const deleteLoading = ref(false);

const newOperatorData = ref<UserCreationData>({
  name: "",
  surname: "",
  known_stations: [],
  status: "available" as Status,
});

const loadingHandler = (loadingState: boolean) => {
  loading.value = loadingState;
};

const deleteLoadingHandler = (loadingState: boolean) => {
  deleteLoading.value = loadingState;
};

defineProps<{
  multipleSelection: string[];
}>();
</script>

<style scoped lang="scss">
:deep(.el-button){
@include fluid-desktop-font(14px, 17px);
}
</style>
