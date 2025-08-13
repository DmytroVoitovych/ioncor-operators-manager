import { defineStore } from "pinia";
import { Operator, StationNumber, User, UserCreationData } from "~/maintypes/types";
import { supabase } from "~/utils/supabase";
import { useStationsStore } from "./stations";
import { removePersonFromStation } from "~/components/stations/utils/stationAssignmentService";
import { shallowRef } from "vue";
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
    getWorkersCache: (state) => {
      if (state.globalKey) {
        console.log(state.globalKey);
        const stationsStore = useStationsStore();
        return stationsStore?.snapshot?.[state.globalKey]?.snp_workers || state.workers;
      }
      return state.workers;
    },
  },
  actions: {
    changeWorkersCache(workers: Operator[]) {
      if (!workers?.length) return;
      const stationsStore = useStationsStore();
      if (stationsStore.snapshot?.[this.globalKey]) {
        stationsStore.snapshot[this.globalKey].snp_workers = workers;
        return;
      }
      this.workers = workers;
    },
    setGlobalKey(key: string) {
      this.globalKey = key;
    },
    replaceWorkers(key: string) {
      const stationsStore = useStationsStore();
      if (!stationsStore.getSnapshotMap.get(key)?.snp_workers) return;
      this.workers = stationsStore.snapshot[key].snp_workers;
    },
    getWorkersById(id: string) {
      return this.workers.find((worker) => worker.id === id);
    },
    setCurrentStation(id: string, station: StationNumber) {
      const workerIndex = this.workers.findIndex((e) => e.id === id);
      this.workers[workerIndex].current_station = station;
    },

    clearCurrentOperatorsStation() {
      this.workers?.forEach((worker) => {
        if (worker.current_station !== ("unassigned" as StationNumber))
          worker.current_station = "unassigned" as StationNumber;
      });
    },

    unassignOperator(worker: Operator) {
      if (worker.current_station !== ("unassigned" as StationNumber))
        worker.current_station = "unassigned" as StationNumber;
      return;
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

      if (
        worker.known_stations.every((e) => worker.visited_stations.includes(e)) ||
        worker.visited_stations.length > 124
      ) {
        worker.visited_stations = [worker.station_history?.at(-1)?.station as StationNumber];
      }
    },

    setWorkerHistory(id: string, station: StationNumber, date: Date) {
      const workerIndex = this.workers.findIndex((e) => e.id === id);
      const worker = this.workers[workerIndex];

      worker.station_history ??= [];

      worker.station_history.push({ station, date });
      if (station !== ("unassigned" as StationNumber))
        this.handleWorkerStationVisiting(worker, station);
    },

    getWorkers() {
      this.error = null;

      return Promise.resolve(supabase.from("operatorslist").select("*"))
        .then(({ data, error }) => {
          if (!error) this.workers = data;
          else this.error = error.message;
        })
        .catch((err) => console.log(err))
        .finally();
    },
    deleteWorker(id: string, loadingHandler: (loadingState: boolean) => void) {
      loadingHandler(true);
      this.error = null;

      const worker = this.workers?.find((e) => e.id === id);
      const workerIndex = this.workers?.findIndex((e) => e.id === id);
      const stStore = useStationsStore();
      const glKey = this.globalKey.split("_")[0];

      Promise.resolve(supabase.from("operatorslist").delete().eq("id", id))
        .then(({ error }) => {
          if (!error) {
            if (stStore.getSnapshotMap.has(this.globalKey)) {
              stStore.deleteWorkerFromSnapshot(glKey, id);
              stStore.saveNewSnapshot();
            }
            if (worker && worker.current_station !== ("unassigned" as StationNumber)) {
              stStore.unassignPerson(
                worker.current_station,
                stStore.choseSideById(worker.current_station, id),
                id,
              );
            }
            this.workers.splice(workerIndex, 1);
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
      const filteredArrForDelete = this.workers.filter((worker) => selectedIds.includes(worker.id));
      const filteredArrForReplace = this.workers.filter(
        (worker) => !selectedIds.includes(worker.id),
      );

      const stStore = useStationsStore();
      const glKey = this.globalKey.split("_")[0];

      Promise.resolve(supabase.from("operatorslist").delete().in("id", selectedIds))
        .then(({ error }) => {
          if (!error) {
            if (stStore.getSnapshotMap.has(this.globalKey)) {
              filteredArrForDelete.forEach(({ id }) => stStore.deleteWorkerFromSnapshot(glKey, id));
              stStore.saveNewSnapshot();
            }

            filteredArrForDelete.forEach(({ current_station, id }) => {
              if (current_station !== ("unassigned" as StationNumber))
                stStore.unassignPerson(
                  current_station,
                  stStore.choseSideById(current_station, id),
                  id,
                );
            });
            this.workers = filteredArrForReplace;
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

      const stStore = useStationsStore();
      const glKey = this.globalKey.split("_")[0];

      Promise.resolve(supabase.from("operatorslist").insert(worker).select())
        .then(({ data, error }) => {
          if (!error) {
            console.log("Worker added:", data);

            this.workers = [...this.getWorkersCache, ...data];

            const operator: Operator = data[0];
            stStore.addWorkerInSnapshot(glKey, operator);
            if (stStore.getSnapshotMap.has(this.globalKey)) stStore.saveNewSnapshot();
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

      const updatePersonInSnapshot = () => {
        const stStore = useStationsStore();
        const glDate = this.globalKey.split("_")[0];
        if (stStore.getSnapshotMap.has(this.globalKey)) {
          for (const [key] of stStore.getSnapshotMap) {
            const keyDate = dayjs(key.split("_")[0]);
            if (keyDate.isBefore(glDate, "day")) continue;
            const snapData = stStore.snapshot[key];
            const futureWorker: Operator | undefined = snapData?.snp_workers?.find(
              (e) => e.id === id,
            );
            if (futureWorker) {
              (Object.keys(field) as (keyof Operator)[]).forEach((key) => {
                if (key !== "current_station")
                  (futureWorker[key] as Operator[typeof key]) = field[key];
              });
            }
          }
        }
      };

      const updateStationList = () => {
        const store = useStationsStore();
        const current = field?.current_station;
        const status = field?.status;
        const currentSt = this.workers[indexWorker].current_station;
        const isAssigned = currentSt !== ("unassigned" as StationNumber);
        const isStatusChanged = status && status !== "available";

        if (isStatusChanged && isAssigned) {
          this.unassignOperator(this.workers[indexWorker]);
          removePersonFromStation(id, currentSt);
          store.removeHistory(this.workers[indexWorker]);
          store.reactOnStatusChange(this.globalKey, id, status);
        }

        if (current) {
          const choseSide = () => {
            if (store.stations[current] && store.stations[current] === 2) {
              return store.assignments[current]?.left ? "right" : "left";
            }

            return "right";
          };
          const assignmentStationType =
            current !== ("unassigned" as StationNumber) ? current : ("unassigned" as StationNumber);

          if (status === "available") {
            store.reactOnStatusChange(this.globalKey, id, status);
            this.setWorkerHistory(
              id,
              assignmentStationType,
              dayjs(this.globalKey.split("_")[0]).toDate(),
            );
          }
          store.outerAssignByTable(assignmentStationType, choseSide(), id);
        }
      };

      Promise.resolve(supabase.from("operatorslist").update(field).eq("id", id).select())
        .then(({ data, error }) => {
          if (!error) {
            console.log("Worker updated:", data);
            if (indexWorker !== -1) {
              updatedWorkerFields();
              updateStationList();
              updatePersonInSnapshot();
              const store = useStationsStore();
              if (store.getSnapshotMap.has(this.globalKey)) store.saveNewSnapshot();
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
  persist: {
    pick: ["workers"],
  },
});
