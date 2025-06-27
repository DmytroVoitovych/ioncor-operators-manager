import { th } from "element-plus/es/locales.mjs";
import { defineStore } from "pinia";
import { Operator } from "~/maintypes/types";
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

  actions: {
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
    deleteWorker(id: string) {
      this.loading = true;
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
        .finally(() => (this.loading = false));
    },
    deleteSelectedWorkers(selectedIds: string[]) {

        this.loading = true;
        this.error = null;
        const indexArr = selectedIds.map((id) => this.workers.findIndex((worker) => worker.id === id));

        Promise.resolve(supabase.from("operatorslist").delete().in("id", selectedIds))
          .then(({ error }) => {
            if (!error) {
             indexArr.forEach((index)=>  this.workers.splice(index, 1));
            } else {
              this.error = error.message;
            }
          })
          .catch((err) => console.log(err))
          .finally(() => (this.loading = false));
    },
  },
  persist: true,
});
