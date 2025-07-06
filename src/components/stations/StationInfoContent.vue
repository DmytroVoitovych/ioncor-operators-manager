<template>
  <div class="stationInfo__content">
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
</script>

<style lang="scss">
.stationInfo__content__item {
  display: flex;
  align-items: end;
  gap: 8px;
  color: var(--neutral-300);
}
</style>
