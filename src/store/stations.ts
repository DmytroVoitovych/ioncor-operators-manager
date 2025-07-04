import { defineStore } from "pinia";
import { SideKey } from "~/components/stations/types";
import { STATIONS } from "~/maintypes/types";

export const useStationsStore = defineStore("stations", {
  state: () => ({
    stations: STATIONS,
    assignments: {} as Record<string, {left?:string | SideKey,right:string | SideKey}>,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getStations: (state) => {
      const { addStation, removeStation, ...rest } = state.stations;
      return rest;
    },
    getAssignment: (state) => (stationId: string, slotKey:SideKey) => {
       return state.assignments[stationId]?.[slotKey] || "";
    },

  },

  actions: {
    assignPerson(stationId: string, slotKey:SideKey, personId: string) {

      if (!this.assignments[stationId]) this.assignments[stationId]= { right: "" };
      this.assignments[stationId][slotKey] = personId;

    },
  },
});
