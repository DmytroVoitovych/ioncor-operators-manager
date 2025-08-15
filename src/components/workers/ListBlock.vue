<template>
  <el-table :default-sort="{ prop: 'name', order: 'ascending' }" :row-class-name="tableRowClassName"
    :data="store.workers" style="width: 100%" @selection-change="extractIds" show-overflow-tooltip>
    <el-table-column type="expand">
      <template #default="props">
        <ul>
          <li>Full Name: <span class="text-preset-8-mono">{{ props.row.name }} {{ props.row.surname }}</span></li>
          <li>Trained Stations: <span class="text-preset-8-mono">{{ props.row.known_stations.join(", ") }}</span></li>
          <li>
            Station History:
            <el-table class="text-preset-8-mono" border :data="props.row.station_history?.slice(-30) || []"
              style="padding: 0px">
              <el-table-column prop="date" label="Date" :formatter="(row, coll, val) => transformDate(val)" />
              <el-table-column prop="station" label="Station" />
            </el-table>
          </li>
        </ul>
      </template>
    </el-table-column>
    <el-table-column type="selection"></el-table-column>
    <el-table-column prop="name" label="Name" />
    <el-table-column prop="surname" label="Surname" />
    <el-table-column prop="status" label="Status" :filters="[
      { text: 'Available', value: 'available' },
      { text: 'Sick Leave', value: 'sick-leave' },
      { text: 'Vacation', value: 'vacation' },
      { text: 'Day Off', value: 'day-off' },
      { text: 'Unknown', value: 'unknown' },
    ]" :filter-method="filterTag" filter-placement="bottom-end" />
    />
    <el-table-column prop="current_station" label="Current Station" class-name="text-preset-8-mono" />
    <el-table-column fixed="right" label="Operations" min-width="120">
      <template #default="scope">
        <div class="operationBlock">
          <EditOperatorBlock :operatorId="scope.row.id" />
          <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" :icon="InfoFilled"
            icon-color="var(--blue-600)" title="Are you sure to delete this?" @confirm="
              deleteWorker(scope.row.id, (loading) => setDeleteLoading(scope.row.id, loading))
              ">
            <template #reference>
              <el-button type="danger" size="small" :loading="deleteLoadingState[scope.row.id] || false" plain>
                delete
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <TableButtonBlock :multipleSelection />
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import dayjs from "dayjs";
import { useWorkersStore } from "~/store/workers";
import { Operator } from "~/maintypes/types";
import { InfoFilled } from "@element-plus/icons-vue";

const store = useWorkersStore();

const { deleteWorker } = store;
const multipleSelection = ref<string[]>([]);

const transformDate = (date: string) => dayjs(date).format("MMMM D, YYYY");
const extractIds = (items: Operator[]) => (multipleSelection.value = items.map((item) => item.id));

const deleteLoadingState = reactive<Record<string, boolean>>({});

const setDeleteLoading = (id: string, loading: boolean) => {
  deleteLoadingState[id] = loading;
};

const tableRowClassName = ({ row }: { row: Operator }) => {
  return String(row.status);
};

const filterTag = (value: string, row: Operator) => {
  return row.status === (value as unknown);
};


</script>

<style scoped lang="scss">
.el-table {
  padding: 8px;

  & :deep(.el-table__body-wrapper) {
    max-height: 60vh;
    overflow-y: auto;
  }
}

.el-table :deep(.el-table__cell) {
  padding: 4px 0px;
}

.el-table :deep(.cell) {
  display: flex;
  line-height: 22px;
  @include fluid-desktop-font(14px, 17px);

  &.el-tooltip {
    display: block;
  }
}

.operationBlock {
  display: flex;
  gap: 8px;

  @include mq(tablet){
  gap: unset;
  justify-content: center;
  }

}

.tableButtonBlock {
  background-color: #ffffff;
  display: grid;
  row-gap: 8px;
  padding: 12px;

  & .el-button {
    margin-left: 0;
  }
}

.el-button--small{
@include fluid-desktop-font(12px, 15px);
}
</style>
