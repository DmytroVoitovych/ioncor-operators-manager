<template>
 <div class="scheduleAbsentInfo ">
     <el-text :type="absentColor" class="text-preset-9">{{ absentInfo }}</el-text>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{operatorsAmount:number, stationsAmount:number,absentAmount:number}>();

const absentInfo  = computed(()=>{
 const amountInfo = `${props.operatorsAmount} / ${props.stationsAmount}`;

 if(!props.absentAmount) return `You have enough operators for work: ${amountInfo}`;
 else if(props.absentAmount < 0)return `There’s a surplus worker because there are more workers than stations: ${amountInfo}`;
 else if(props.absentAmount === 1) return `You lack one operator ${amountInfo} One slot will be excluded from the station 200`;
 else return `You don't have enough operators ${amountInfo} When generating the slot will be filled with "Extra"`;
});

const absentColor  = computed(()=>{

 if(!props.absentAmount) return 'success';
 else if(props.absentAmount === 1 || props.absentAmount < 0) return 'warning';
 else return 'danger';
});

</script>

<style scoped lang="scss">
.el-text{
 @include fluid-desktop-font(14px, 17px);
}

</style>
