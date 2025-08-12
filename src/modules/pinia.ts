import { createPinia} from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { nextTick } from "vue";
import { useShiftAuth } from "~/composables/useAuth";
import type { UserModule } from "~/types";


export const install: UserModule = async ({ app }) => {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);
  const { isAuthenticated, loading, authInit } = useShiftAuth();

   try {

    await authInit();

    if (!import.meta.env.SSR && isAuthenticated.value) {
      await nextTick();

      try {
        const { useWorkersStore } = await import("~/store/workers");
        const { useStationsStore } = await import("~/store/stations");

        await Promise.allSettled([
        await  useWorkersStore().getWorkers(),
        await useStationsStore().getStationsFromDB(),
        useStationsStore().getFreshSnapShots(useWorkersStore().globalKey)
        ]);
      } catch (dataError) {
        console.error('Data loading error:', dataError);
      }
    }
  } catch (authError) {
    console.error('An initialization of authentication:', authError);
  } finally {
     loading.value = false;

  }
};
