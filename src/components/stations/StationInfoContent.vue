<template>
  <div :class="`stationInfo__content ${statusClass}`">
    <p class="stationInfo__content__item">
      <User color="var(--neutral-300)" width="16" height="16" />
      <span class="stationInfo__content__item__value text-preset-9"
        >{{ isOperatorAssigned }} / {{ station }} <slot></slot
      ></span>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { User } from "@element-plus/icons-vue";
import { computed } from "vue";

const props = defineProps<{
  rightSide: string;
  leftSide: string;
  station: number;
}>();

const isOperatorAssigned = computed(() => {
  if (props.leftSide && props.rightSide) return props.station;
  else if (props.rightSide || props.leftSide) return 1;

  return 0;
});

const statusClass = computed(() => {
  const oneSideSt = isOperatorAssigned.value && props.station === 1;
  const oneMissing = props.station === 2 && isOperatorAssigned.value === 1;

  if (isOperatorAssigned.value === 2 || oneSideSt) return "assigned";
  if (oneMissing) return "partialy";
  return "";
});
</script>

<style lang="scss">
.stationInfo__content__item {
  display: flex;
  align-items: end;
  gap: 8px;
  color: var(--neutral-300);
}
</style>
