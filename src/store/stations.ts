import { defineStore } from "pinia";
import { SideKey } from "~/components/stations/types";
import { Operator, StationId, StationMap, StationNumber, STATIONS } from "~/maintypes/types";
import { useWorkersStore } from "./workers";
import { removePersonFromStation } from "~/components/stations/utils/stationAssignmentService";
import { findWorkerById, isExtraAssignment } from "~/components/stations/utils/workerUtils";
import { dayjs } from "element-plus";
import { supabase } from "~/utils/supabase";
import { FIRST_LIST } from "~/components/stations/constants";

type NavigationItem = {
  left?: string | SideKey;
  right: string | SideKey;
};

type NavigationConfig = Record<string, NavigationItem>;

export const useStationsStore = defineStore("stations", {
  state: () => ({
    stations: STATIONS,
    assignments: {} as NavigationConfig,
    snapshot: {} as Record<
      string,
      {
        snp_workers: Operator[];
        snp_assignments: NavigationConfig;
      }
    >,
    isApproved: true,
    enable_extra: false,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getStations: (state) => {
      const { addStation, removeStation, changeRequiredPeople, ...rest } = state.stations;
      return rest;
    },
    getAssignment: (state) => (stationId: string, slotKey: SideKey) => {
      return state?.assignments?.[stationId]?.[slotKey] || (state.enable_extra ? "Extra" : "");
    },

    getSnapshotMap: (state) => new Map(Object.entries(state.snapshot)),

    isAssignmentEmpty: (state) => !Object.keys(state.assignments).length,
  },

  actions: {
    switchApprovmentFlag(flag: boolean) {
      this.isApproved = flag;
    },
    choseSide(checkStation: NavigationItem) {
      return checkStation?.left && checkStation?.right
        ? "left"
        : !checkStation?.left && !checkStation?.right
          ? "right"
          : !checkStation?.left && checkStation?.right
            ? "left"
            : "right";
    },
    choseSideById(checkStation: StationNumber, id: string) {
      if (this.stations[checkStation] && this.stations[checkStation] === 2) {
        return this.assignments[checkStation]?.left !== id ? "right" : "left";
      }

      return "right";
    },
    removeHistory(person: Operator) {
      return person?.station_history?.pop();
    },
    replaceAssignments(key: string) {
      if (!this.getSnapshotMap.get(key)?.snp_assignments) return;
      this.assignments = this.getSnapshotMap.get(key)!.snp_assignments;
    },
    getInitialState(slotKey: SideKey) {
      return slotKey === "right" ? { right: "" } : { right: "", left: "" };
    },
    getStationsMandatoryAmount(amount: number) {
      return amount === 1 ? "right" : "left";
    },
    removePerson(personId: string) {
      if (this.isAssignmentEmpty) return;

      for (const key in this.assignments) {
        if (this.assignments[key]?.left === personId) {
          this.assignments[key].left = "";
          break;
        }
        if (this.assignments[key].right === personId) {
          this.assignments[key].right = "";
          break;
        }
      }
    },

    initializeStateFromWorkersStore() {
      // const workersStore = useWorkersStore();
      // workersStore.workers.forEach(({id,current_station})=>{
      //  const side = this.getStationsMandatoryAmount(this.getStations[current_station]);
      //  this.assignPerson(current_station,side,id);
      // })
    },

    unassignPerson(stationId: StationId, slotKey: SideKey, personId: string){
    const workersStore = useWorkersStore();
    const worker = workersStore.getWorkersById(personId);
    if(!worker) return;

      removePersonFromStation(personId,stationId);
      this.removeHistory(worker);
      this.assignments[stationId][slotKey] = '';
      workersStore.unassignOperator(worker);
    },

    assignPerson(stationId: StationId, slotKey: SideKey, personId: string) {
      this.assignments[stationId] ??= this.getInitialState(slotKey);

      const workersStore = useWorkersStore();

      this.removePerson(personId);
      this.assignments[stationId][slotKey] = personId;
      workersStore.setCurrentStation(personId, stationId);
    },
    outerAssignByTable(stationId: StationId, slotKey: SideKey, personId: string) {
      this.assignments[stationId] ??= this.getInitialState(slotKey);

      const workersStore = useWorkersStore();
      const date = dayjs(workersStore.globalKey.split("_")[0]);
      this.executeWorkerAssignment(stationId, slotKey, personId, date.toString());
    },
    addWorkerInSnapshot(keyGlobal:string,newWorker:Operator,){
    const currentDate = keyGlobal;

     for (const [key] of this.getSnapshotMap) {
        if(!key) break;

        const snapData = this.snapshot[key];
        const worker = snapData.snp_workers?.find((e) => e.id === newWorker?.id);
       const keyDate = dayjs(key.split('_')[0]);

        if (worker &&  (!keyDate.isAfter(currentDate) || !keyDate.isSame(currentDate))) continue;

        this.snapshot[key].snp_workers = [...this.snapshot[key].snp_workers,newWorker];

     }
    },
    deleteWorkerFromSnapshot(keyGlobal:string,personId: string,){
    const currentDate = keyGlobal;

     for (const [key] of this.getSnapshotMap) {
        if(!key) break;

        const snapData = this.snapshot[key];
        const worker = snapData.snp_workers?.find((e) => e.id === personId);
        const workerId = snapData.snp_workers?.findIndex((e) => e.id === personId);
        const keyDate = dayjs(key.split('_')[0]);

        if (workerId === -1 &&  (!keyDate.isAfter(currentDate) || !keyDate.isSame(currentDate))) continue;
        if(worker?.current_station !== 'unassigned' as StationNumber ){

        const snapAssignment = snapData.snp_assignments[worker!.current_station];
        const side = snapAssignment?.left === personId?'left':'right';
        this.snapshot[key].snp_assignments[worker!.current_station][side] = 'Extra';
        }
        this.snapshot[key].snp_workers.splice(workerId,1);
     }
    },
    updateStationHistory(date: string, personId: string, stationId: StationId) {
      const cycleDate = dayjs(date).format("YYYY-MM-DD");
      const sourceWorker = findWorkerById(useWorkersStore().workers, personId);
      if (!sourceWorker) return;

      const n =
        sourceWorker.station_history?.filter(
          (e) => dayjs(e.date).format("YYYY-MM-DD") === cycleDate,
        )?.length || 0;

      if (n === 0) return;

      for (const [key] of this.getSnapshotMap) {
        const worker = this.snapshot[key].snp_workers.find((e) => e.id === personId);
        if (!worker) continue;

        const dayRecords = worker.station_history?.filter(
          (e) => dayjs(e.date).format("YYYY-MM-DD") === cycleDate,
        );

        if (dayRecords[n - 1]) {
          dayRecords[n - 1].station = stationId;
        }
      }
    },
    performWorkerSwap(currentAssignedId: string, personId: string, stationId: StationId) {
      const workersStore = useWorkersStore();
      const worker = workersStore.workers.find((e) => e.id === currentAssignedId);
      const desiredWorker = workersStore.workers.find((e) => e.id === personId);

      const swapOrRemove = worker?.known_stations.includes(desiredWorker!.current_station)
        ? desiredWorker!.current_station
        : "unassigned";

      const el = this.removeHistory(worker!);
      const date = el?.date || dayjs(workersStore.globalKey.split("_")[0]).toDate();

      if (swapOrRemove !== "unassigned") {
        removePersonFromStation(worker!.id, swapOrRemove);
        workersStore.setWorkerHistory(worker!.id, swapOrRemove, date);
        this.assignPerson(
          swapOrRemove as StationNumber,
          this.choseSideById(swapOrRemove, desiredWorker!.id),
          worker!.id,
        );
      }

      if (swapOrRemove === "unassigned") {
        workersStore.setCurrentStation(worker!.id, "unassigned" as StationNumber);
        workersStore.setWorkerHistory(worker!.id, swapOrRemove as StationNumber, date);
      }

      this.updateStationHistory(date.toString(), worker!.id, swapOrRemove as StationId);

      this.removeHistory(desiredWorker!);
      removePersonFromStation(personId, stationId);
      workersStore.setWorkerHistory(personId, stationId, date);
      this.updateStationHistory(date.toString(), personId, stationId);
    },

    prepareDesiredWorker(personId: string, stationId: StationId, date: string) {
      const workersStore = useWorkersStore();
      const desiredWorker = workersStore.workers.find((e) => e.id === personId);
      const dsWorkerCurrentSt = desiredWorker!.current_station as StationNumber | "unassigned";

      if (desiredWorker?.station_history?.at(-1)?.station === dsWorkerCurrentSt)
        desiredWorker?.station_history?.pop();
      removePersonFromStation(personId, stationId);
      workersStore.setWorkerHistory(personId, stationId, new Date(date));
      this.updateStationHistory(date, personId, stationId);
    },

    executeWorkerAssignment(
      stationId: StationId,
      slotKey: SideKey,
      personId: string,
      date: string,
    ) {
      const currentAssignedId = this.getAssignment(stationId, slotKey);
      const shouldSwap = currentAssignedId && !isExtraAssignment(currentAssignedId);

      if (shouldSwap) this.performWorkerSwap(currentAssignedId, personId, stationId);

      this.prepareDesiredWorker(personId, stationId, date);
      this.assignPerson(stationId, slotKey, personId);
      this.switchApprovmentFlag(false);
    },

    cleanupDuplicateAssignments(worker: Operator) {
      if (worker.current_station !== ("unassigned" as StationNumber)) {
        const checkStation = this.assignments[worker.current_station];
        const side = this.choseSide(checkStation);

        const twoSide =
          this.stations[worker.current_station] === 2 && checkStation?.left && checkStation?.right;
        const oneSide = this.stations[worker.current_station] === 1 && checkStation?.right;

        if (twoSide || oneSide || worker.status !== 'available') worker.current_station = "unassigned" as StationNumber;
        else this.outerAssignByTable(worker.current_station, side, worker.id);
      }
    },

    getStationsFromDB() {
      Promise.resolve(supabase.from("stationslist").select("stations").single())
        .then((e) => {
          this.stations = Object.assign(this.stations, e.data?.stations || {});
        })
        .catch((err) => console.log(err))
        .finally(() => console.log("fi", this.stations));
    },
    getFreshSnapShots(key: string) {

      const nightShiftProtection = dayjs(key.split("_")[0]).subtract(1, "day").format('YYYY-MM-DD') + FIRST_LIST;
      Promise.resolve(
        supabase.rpc("get_snapshot_keys_from_date", {
          from_key: nightShiftProtection,
          max_keys: 150,
        }),
      ).then((e) => {

        if (!e.data[key]) {
          const workerStore = useWorkersStore();
          this.assignments = {};
          workerStore.workers?.forEach(this.cleanupDuplicateAssignments);
          this.snapshot = e.data;
          console.log(this.snapshot);
          return;
        }

        this.snapshot = e.data;
        this.assignments = this.snapshot[key].snp_assignments;
        useWorkersStore().workers = this.snapshot[key].snp_workers;
      });
    },
    saveNewSnapshot() {
      Promise.resolve(
        supabase.rpc("merge_station_snapshot", {
          partial_snapshot: this.snapshot,
        }),
      ).finally(() => console.log("ssss"));
    },
  },

},

);
