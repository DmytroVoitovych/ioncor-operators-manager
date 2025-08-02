import { fa, th } from "element-plus/es/locales.mjs";
import { defineStore } from "pinia";
import { Ref } from "vue";
import { Operator, StationNumber, UserCreationData } from "~/maintypes/types";
import { supabase } from "~/utils/supabase";
import { useStationsStore } from "./stations";
import { dayjs } from "element-plus";

interface State {
  workers: Operator[];
  loading: boolean;
  error: string | null;
  globalKey: string;
}

export const useWorkersStore = defineStore("workersStore", {
  state: (): State => ({
    workers: [],
    loading: false,
    error: null,
    globalKey: "",
  }),

  getters: {
    // getWorkersById: (state) => {
    //   return (id: string): Operator | undefined => {
    //     return state.workers.find((worker) => worker.id === id);
    //   };
    // },
  },
  actions: {
    setGlobalKey(key: string) {
      this.globalKey = key;
    },
    replaceWorkers(snapShot: Operator[]) {
      if (!snapShot?.length) return;
      this.workers = snapShot;
    },
    getWorkersById(id: string) {
      return this.workers.find((worker) => worker.id === id);
    },
    setCurrentStation(id: string, station: StationNumber) {
      const workerIndex = this.workers.findIndex((e) => e.id === id);
      this.workers[workerIndex].current_station = station;
    },

    clearCurrentOperatorsStation(){
     this.workers?.forEach((worker)=>{
        if(worker.current_station !== 'unassigned' as StationNumber) worker.current_station = 'unassigned' as StationNumber;
     });
    },

    removeVisitedStation(personId: string, station: StationNumber) {
      const workerIndex = this.workers.findIndex((e) => e.id === personId);
      const worker = this.workers[workerIndex];

      if (!worker || !worker.visited_stations?.length) return;

      const stationIndex = worker.visited_stations.indexOf(station);
      if (stationIndex !== -1) worker.visited_stations.splice(stationIndex, 1);
    },

    handleWorkerStationVisiting(worker: Operator, station: StationNumber) {
      worker.visited_stations ??= [];
      worker.visited_stations.push(station);

      if (worker.known_stations.every((e) => worker.visited_stations.includes(e))) {
        worker.visited_stations = [worker.visited_stations.at(-1) as StationNumber];
      }
    },

    setWorkerHistory(id: string, station: StationNumber, date: Date) {
      const workerIndex = this.workers.findIndex((e) => e.id === id);
      const worker = this.workers[workerIndex];

      this.handleWorkerStationVisiting(worker, station);

      worker.station_history ??= [];
      worker.station_history.push({ station, date });
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
          if (key !== "current_station")
            (this.workers[indexWorker][key] as Operator[typeof key]) = field[key];
        });

      const updateStationList = () => {
        const store = useStationsStore();
        const current = field?.current_station;

        if (current) {
          const checkStation = store.assignments[current];
          const choseSide =
            checkStation?.left && checkStation?.right
              ? "left"
              : !checkStation?.left && !checkStation?.right
                ? "right"
                : !checkStation?.left && checkStation?.right
                  ? "left"
                  : "right";

          store.outerAssignByTable(current, choseSide, id);
        }
      };

      Promise.resolve(supabase.from("operatorslist").update(field).eq("id", id).select())
        .then(({ data, error }) => {
          if (!error) {
            console.log("Worker updated:", data);
            if (indexWorker !== -1) {
              updatedWorkerFields();
              updateStationList();
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
