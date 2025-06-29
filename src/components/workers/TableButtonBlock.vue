<template>
  <div class="tableButtonBlock">
    <OperatorCreation
      v-model:form="newOperatorData"
      @add-operator="(callback: () => void) => addWorker(newOperatorData, callback)"
    />
    <el-popconfirm
      confirm-button-text="Yes"
      cancel-button-text="No"
      :icon="InfoFilled"
      icon-color="var(--blue-600)"
      title="Are you sure to delete these selected operators?"
      @confirm="deleteSelectedWorkers(multipleSelection)"
      width="300"
    >
      <template #reference>
        <el-button :disabled="!multipleSelection.length" type="danger" plain style="width: 100%">
          Delete selected Operators
        </el-button>
      </template>
    </el-popconfirm>
  </div>
</template>

<script lang="ts" setup>
import { InfoFilled } from "@element-plus/icons-vue";
import { ref } from "vue";
import { UserCreationData, UserStatus } from "~/maintypes/types";
import { useWorkersStore } from "~/store/workers";

const store = useWorkersStore();
const { deleteSelectedWorkers, addWorker } = store;

const newOperatorData = ref<UserCreationData>({
  name: "",
  surname: "",
  known_stations: [],
  status: "available" as unknown as UserStatus,
});

defineProps<{
  multipleSelection: string[];
}>();
</script>

<style scoped></style>
