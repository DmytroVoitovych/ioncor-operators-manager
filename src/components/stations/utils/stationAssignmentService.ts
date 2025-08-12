import { StationNumber } from "~/maintypes/types";
import { SideKey } from "../types";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";

const removePersonFromStation = (personId: string, stationId: StationNumber) => {
  const stationsStore = useStationsStore();
  const workersStore = useWorkersStore();

  stationsStore.removePerson(personId);
  workersStore.removeVisitedStation(personId, stationId);
};

const assignWorkerToStation = (workerId: string, targetStation: StationNumber, side: SideKey) => {
  const stationsStore = useStationsStore();

  stationsStore.assignPerson(targetStation, side, workerId);
};

export { assignWorkerToStation, removePersonFromStation };
