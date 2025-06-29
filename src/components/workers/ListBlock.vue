<template>
  <el-table
    :default-sort="{ prop: 'name', order: 'ascending' }"
    :row-class-name="tableRowClassName"
    :data="tableData"
    style="width: 100%"
    @selection-change="extractIds"
    show-overflow-tooltip
  >
    <el-table-column type="expand">
      <template #default="props">
        <ul>
          <li>Full Name: {{ props.row.name }} {{ props.row.surname }}</li>
          <li>Trained Stations: {{ props.row.known_stations.join(", ") }}</li>
          <li>
            Station History:
            <el-table border :data="props.row.station_history" style="padding: 0px">
              <el-table-column
                prop="date"
                label="Date"
                :formatter="(row, coll, val) => transformDate(val)"
              />
              <el-table-column prop="station" label="Station" />
            </el-table>
          </li>
        </ul>
      </template>
    </el-table-column>
    <el-table-column type="selection"></el-table-column>
    <el-table-column prop="name" label="Name" />
    <el-table-column prop="surname" label="Surname" />
    <el-table-column
      prop="status"
      label="Status"
      :filters="[
        { text: 'Available', value: 'available' },
        { text: 'Sick Leave', value: 'sick-leave' },
        { text: 'Vacation', value: 'vacation' },
        { text: 'Day Off', value: 'day-off' },
        { text: 'Unknown', value: 'unknown' },
      ]"
      :filter-method="filterTag"
      filter-placement="bottom-end"
    />
    />
    <el-table-column prop="current_station" label="Current Station" />
    <el-table-column fixed="right" label="Operations" min-width="100">
      <template #default="scope">
        <div class="operationBlock">
          <EditOperatorBlock :operatorId="scope.row.id" />
          <el-popconfirm
            confirm-button-text="Yes"
            cancel-button-text="No"
            :icon="InfoFilled"
            icon-color="var(--blue-600)"
            title="Are you sure to delete this?"
            @confirm="deleteWorker(scope.row.id)"
          >
            <template #reference>
              <el-button type="danger" size="small" plain> delete </el-button>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <TableButtonBlock :multipleSelection />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import dayjs from "dayjs";
import { useWorkersStore } from "~/store/workers";
import { Operator } from "~/maintypes/types";
import { storeToRefs } from "pinia";
import { InfoFilled } from "@element-plus/icons-vue";

const store = useWorkersStore();
const { workers: tableData } = storeToRefs(store);
const { deleteWorker } = store;

const multipleSelection = ref<string[]>([]);

const transformDate = (date: string) => dayjs(date).format("MMMM D, YYYY");
const extractIds = (items: Operator[]) => (multipleSelection.value = items.map((item) => item.id));

// const now = new Date();

const tableRowClassName = ({ row }: { row: Operator }) => {
  return String(row.status);
};

const filterTag = (value: string, row: Operator) => {
  return row.status === (value as unknown);
};
</script>

<style scoped>
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

  &.el-tooltip {
    display: block;
  }
}

.operationBlock {
  display: flex;
  gap: 8px;
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
</style>
