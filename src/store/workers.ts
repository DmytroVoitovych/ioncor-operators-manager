import { fa, th } from "element-plus/es/locales.mjs";
import { defineStore } from "pinia";
import { Ref } from "vue";
import { Operator, UserCreationData } from "~/maintypes/types";
import { supabase } from "~/utils/supabase";

interface State {
  workers: Operator[];
  loading: boolean;
  error: string | null;
}

export const useWorkersStore = defineStore("workersStore", {
  state: (): State => ({
    workers: [],
    loading: false,
    error: null,
  }),

  getters: {
    // getWorkersById: (state) => {
    //   return (id: string): Operator | undefined => {
    //     return state.workers.find((worker) => worker.id === id);
    //   };
    // },
  },
  actions: {
    getWorkersById(id: string) {
      return this.workers.find((worker) => worker.id === id);
    },
    getWorkers() {
      this.loading = true;
      this.error = null;

      Promise.resolve(supabase.from("operatorslist").select("*"))
        .then(({ data, error }) => {
          if (!error) this.workers = data;
          else this.error = error.message;
        })
        .catch((err) => console.log(err))
        .finally(() => (this.loading = false));
    },
    deleteWorker(id: string, loadingHandler: (loadingState: boolean) => void) {
      loadingHandler(true);
      this.error = null;
      const index = this.workers.findIndex((worker) => worker.id === id);

      Promise.resolve(supabase.from("operatorslist").delete().eq("id", id))
        .then(({ error }) => {
          if (!error) {
            this.workers.splice(index, 1);
          } else {
            this.error = error.message;
          }
        })
        .catch((err) => console.log(err))
        .finally(() => loadingHandler(false));
    },
    deleteSelectedWorkers(selectedIds: string[], loadingHandler: (loadingState: boolean) => void) {
      loadingHandler(true);
      this.error = null;
      const filteredArr = this.workers.filter((worker) => !selectedIds.includes(worker.id));

      Promise.resolve(supabase.from("operatorslist").delete().in("id", selectedIds))
        .then(({ error }) => {
          if (!error) {
            this.workers = filteredArr;
          } else {
            this.error = error.message;
          }
        })
        .catch((err) => console.log(err))
        .finally(() => loadingHandler(false));
    },
    addWorker(
      worker: UserCreationData,
      callback: () => void,
      loadingHandler: (loadingState: boolean) => void,
    ) {
      loadingHandler(true);
      this.error = null;

      Promise.resolve(supabase.from("operatorslist").insert(worker).select())
        .then(({ data, error }) => {
          if (!error) {
            console.log("Worker added:", data);
            this.workers = [...this.workers, ...data];
          } else {
            this.error = error.message;
          }
        })
        .catch((err) => console.log(err))
        .finally(() => {
          loadingHandler(false);
          callback();
        });
    },
    updateWorker(
      field: Operator,
      id: string,
      callback: () => void,
      loadingHandler: (loadingState: boolean) => void,
    ) {
      loadingHandler(true);
      this.error = null;

      const indexWorker = this.workers.findIndex((worker) => worker.id === id);
      const updatedWorkerFields = () =>
        (Object.keys(field) as (keyof Operator)[]).forEach((key) => {
          (this.workers[indexWorker][key] as Operator[typeof key]) = field[key];
        });

      Promise.resolve(supabase.from("operatorslist").update(field).eq("id", id).select())
        .then(({ data, error }) => {
          if (!error) {
            console.log("Worker updated:", data);
            if (indexWorker !== -1) {
              updatedWorkerFields();
            }
          } else {
            this.error = error.message;
          }
        })
        .catch((err) => console.log(err))
        .finally(() => {
          loadingHandler(false);
          callback();
        });
    },
  },
  persist: true,
});
