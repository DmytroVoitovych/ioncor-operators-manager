<template>
  <el-form
    style="max-width: 600px"
    :model="form"
    label-width="auto"
    @keyup.enter="reqAccess(form.pass, form.shift)"
  >
    <el-form-item label="Shift Password" prop="pass">
      <el-input v-model="form.pass" type="password" autocomplete="off" show-password />
    </el-form-item>
    <el-form-item label="Select shift" prop="shift">
      <el-select-v2 v-model="form.shift" placeholder="Activity count" :options="options" />
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        @click="reqAccess(form.pass, form.shift)"
        :disabled="loading || !!!form.pass.trim()"
      >
        Login
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ShiftKey, useShiftAuth } from "~/composables/useAuth";

const { options, login } = useShiftAuth();

const loading = ref(false);
const form = reactive<{ pass: string; shift: ShiftKey }>({
  pass: "",
  shift: "C",
});

const reqAccess = (pass: string, shift: ShiftKey) => {
  loading.value = true;
  if (pass.trim()) login(shift, pass).finally(() => (loading.value = false));
};
</script>

<style lang="scss" scoped>
.el-form {
  align-self: center;
  justify-self: center;
  background-color: var(--el-color-primary-light-9);
  padding: 20px;
  border: 2px solid var(--el-color-primary-light-7);
  border-radius: 12px;
}

.el-button {
  flex-grow: 1;
}
</style>
