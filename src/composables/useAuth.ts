import { User } from "@supabase/supabase-js";
import { useStorage } from "@vueuse/core";
import { OptionType } from "element-plus/es/components/select-v2/src/select.types.mjs";
import { ref, } from "vue";
import { supabase } from "~/utils/supabase";

export type ShiftKey = "A" | "B" | "C";

export type ShiftInfo = {
  email: string;
  name: string;
};

const SHIFT_CONFIG: Record<ShiftKey, ShiftInfo> = {
  'A': { email: import.meta.env.VITE_SHIFT_A_EMAIL, name: "Shift_A" },
  'B': { email: import.meta.env.VITE_SHIFT_B_EMAIL, name: "Shift_B" },
  'C': { email: import.meta.env.VITE_SHIFT_C_EMAIL, name: "Shift_C" },
};


const loading = ref(true);

const isAuthenticated = useStorage('isAuthenticated', false);
const user = useStorage<User | null>('authUser', null);
const currentShift = useStorage<string | null>('currentShift',null);

export function useShiftAuth() {
  const getCurrentShift =
    (email?:string | null)=>{

    const key:ShiftKey | undefined = email?.split('@')[0].toUpperCase().at(-1) as ShiftKey;

    return key? SHIFT_CONFIG[key].name:key;
  };

  const login = async (shift: ShiftKey, password: string) => {
    loading.value = true;

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: SHIFT_CONFIG[shift].email,
        password,
      });

      if (error) return { success: false, error: error.message };

      user.value = data.user;
      isAuthenticated.value = true;
      currentShift.value = getCurrentShift(user.value?.email || null);

      return { success: true };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    isAuthenticated.value = false;
    user.value = null;
    currentShift.value = null;
  };

  const authInit =  async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      user.value = data.session.user;
     }
    currentShift.value = getCurrentShift(user.value?.email || null);

    if(data.session?.user) isAuthenticated.value = true;
    else isAuthenticated.value = false;
  };

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null;
    currentShift.value = getCurrentShift(user.value?.email || null);
    if(user.value)isAuthenticated.value = true;
    else isAuthenticated.value = false;
  });

  const options = Object.entries(SHIFT_CONFIG).reduce(
    (acc:OptionType[], [key, obj]) => {
  acc.push({ value:key, label:obj.name });
  return acc;
  },
    [],
  );

  return {
    options,
    isAuthenticated,
    loading,
    login,
    logout,
    currentShift,
    authInit
  };
}
