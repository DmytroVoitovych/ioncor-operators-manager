import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { nextTick } from "vue";
import { useShiftAuth } from "~/composables/useAuth";
import type { UserModule } from "~/types";

export const install: UserModule = async ({ app }) => {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);
  const { isAuthenticated, loading, authInit, loadUserData } = useShiftAuth();

  try {
    await authInit();

    if (!import.meta.env.SSR && isAuthenticated.value) {
      await nextTick();
      await loadUserData();
    }
  } catch (authError) {
    console.error("An initialization of authentication:", authError);
  } finally {
    loading.value = false;
  }
};
