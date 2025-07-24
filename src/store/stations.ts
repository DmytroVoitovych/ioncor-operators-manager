import { defineStore } from "pinia";
import { SideKey } from "~/components/stations/types";
import { Operator, StationId, STATIONS } from "~/maintypes/types";
import { useWorkersStore } from "./workers";

export const useStationsStore = defineStore("stations", {
  state: () => ({
    stations: STATIONS,
    assignments: {} as Record<string, { left?: string | SideKey; right: string | SideKey }>,
    snapshot: {} as Record<
      string,
      {
        snp_workers: Operator[];
        snp_assignments: Record<string, { left?: string | SideKey; right: string | SideKey }>;
      }
    >,
    enable_extra:false,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getStations: (state) => {
      const { addStation, removeStation, changeRequiredPeople, ...rest } = state.stations;
      return rest;
    },
    getAssignment: (state) => (stationId: string, slotKey: SideKey) => {
      return state?.assignments?.[stationId]?.[slotKey] || (state.enable_extra?"Extra":"");
    },

    getSnapshotMap: (state) => new Map(Object.entries(state.snapshot)),

    isAssignmentEmpty: (state) => !Object.keys(state.assignments).length,
  },

  actions: {
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

    assignPerson(stationId: StationId, slotKey: SideKey, personId: string) {
      this.assignments[stationId] ??= this.getInitialState(slotKey);

      const workersStore = useWorkersStore();

      this.removePerson(personId);
      this.assignments[stationId][slotKey] = personId;
      workersStore.setCurrentStation(personId, stationId);
    },
    outerAssignByTable(stationId: StationId, slotKey: SideKey, personId: string) {
      this.assignments[stationId] ??= this.getInitialState(slotKey);

      this.removePerson(personId);
      this.assignments[stationId][slotKey] = personId;
    },
  },
});
