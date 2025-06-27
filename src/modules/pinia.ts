import { createPinia, storeToRefs } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { nextTick } from "vue";
import type { UserModule } from "~/types";

export const install: UserModule = ({ app }) => {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);

  if (!import.meta.env.SSR) {
    nextTick(() => {
      import("~/store/workers").then(({ useWorkersStore }) => {
        const workerStore = useWorkersStore();
        workerStore.getWorkers();
      });
    });
  }
};
