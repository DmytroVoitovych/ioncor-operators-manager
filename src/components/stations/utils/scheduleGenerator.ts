import shuffle from "lodash.shuffle";
import { Operator, StationNumber } from "~/maintypes/types";
import {
  findWorkerAsLastResort,
  findWorkerForSwap,
  getSuitableWorkersForReplacement,
} from "./workerReplacementService";
import { assignWorkerToStation, removePersonFromStation } from "./stationAssignmentService";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
import { toRaw } from "vue";
import cloneDeep from "lodash.clonedeep";
//  const firstW =   availableWorkers.filter(e=>e.known_stations.includes('130')).toSorted(
//       (a, b) =>
//         a.station_history?.filter((st) => st.station === "130").length -
//         b.station_history?.filter((st) => st.station === "130").length,
//     )[0]; experimental if some problem will be detected sort will be removed

const test = [];

const generateSchedule = (
  stationsStore: ReturnType<typeof useStationsStore>,
  availableWorkers: Operator[],
  stations: Record<StationNumber, number>,
  date: Date,
) => {
  const station_130 = "130";
  const station130Worker = availableWorkers
    .filter((e) => e.known_stations.includes(station_130))
    .toSorted(
      (a, b) =>
        a.station_history?.filter((st) => st.station === station_130).length -
        b.station_history?.filter((st) => st.station === station_130).length,
    )[0];

  const workersList = new Set(availableWorkers);

  stationsStore.assignments = {};
  workersList.forEach((worker) => (worker.current_station = "unassigned" as StationNumber));
  const shuffledStations = shuffle(Object.keys(stations) as StationNumber[]).filter(
    (e) => e !== station_130,
  );
  const stationsKeys: StationNumber[] = [station_130, ...shuffledStations];

  const choseSide = (checkStation: StationNumber) => {
    if (stations[checkStation] && stations[checkStation] === 2) {
      return stationsStore.assignments[checkStation]?.left ? "right" : "left";
    }

    return "right";
  };

  const getPossibleStations = (worker: Operator) =>
    shuffle(worker.known_stations.filter((e) => !worker.visited_stations?.includes(e)));

  const removeStationIfFull = (
    stationId: StationNumber,
    sts: typeof stations,
    stationsKeys: StationNumber[],
  ) => {
    const indexT = stationsKeys.findIndex((e) => e === stationId);

    const checkSideAssignment =
      sts[stationId] === 2 &&
      stationsStore.assignments[stationId]?.left &&
      stationsStore.assignments[stationId]?.right;

    if (sts[stationId] === 1) stationsKeys.splice(indexT, 1);
    if (checkSideAssignment) stationsKeys.splice(indexT, 1);
  };

  // hand hard station control
  assignWorkerToStation(station130Worker.id, station_130, "right"); // assigned first
  removeStationIfFull(station_130, stations, stationsKeys); // remove from st list
  workersList.delete(station130Worker); // remove from collection current pretendent to 130

  for (const worker of workersList) {
    for (let i = 0; i < stationsKeys.length; i++) {
      const stationId: StationNumber = stationsKeys[i];
      const isKnown = worker.known_stations.includes(stationId as StationNumber);
      const isVisited = worker.visited_stations?.includes(stationId);
      const requiresSwapForLastStation = i === stationsKeys.length - 1 && (!isKnown || isVisited);

      if (requiresSwapForLastStation) {
        const possibleStations = getPossibleStations(worker);
        const replaceWith = getSuitableWorkersForReplacement(
          availableWorkers,
          stationId,
          possibleStations,
          worker.id,
        );

        if (!replaceWith) {
          const newReplaceWith = findWorkerAsLastResort(
            worker,
            stationId,
            availableWorkers,
            possibleStations,
          );

          if (!newReplaceWith) {
            const candidateForSwap = findWorkerForSwap(
              stationId,
              availableWorkers,
              possibleStations,
            );

            // added test for exluded 130
            const stp = possibleStations.find(
              (st) => stationsKeys.includes(st) && st !== station_130,
            )!;

            if (stp && !stationsKeys.includes(stp)) {
              //!!!!!!!!!!!!!!!
              if (!candidateForSwap) debugger;
              removePersonFromStation(candidateForSwap?.id, stationId);
              assignWorkerToStation(
                worker.id,
                candidateForSwap.current_station,
                choseSide(candidateForSwap.current_station),
              );

              assignWorkerToStation(candidateForSwap.id, stationId, choseSide(stationId));
              removeStationIfFull(stationId, stations, stationsKeys);
              break;
            }

            assignWorkerToStation(worker.id, stp, choseSide(stp));
            removeStationIfFull(stp, stations, stationsKeys);
            break;
          }

          removePersonFromStation(newReplaceWith?.id, stationId);
          assignWorkerToStation(
            worker.id,
            newReplaceWith.current_station,
            choseSide(newReplaceWith.current_station),
          );
          assignWorkerToStation(newReplaceWith.id, stationId, choseSide(stationId));
          removeStationIfFull(stationId, stations, stationsKeys);
          break;
        }

        removePersonFromStation(replaceWith?.id, stationId);
        assignWorkerToStation(
          worker.id,
          replaceWith.current_station,
          choseSide(replaceWith.current_station),
        );
        assignWorkerToStation(replaceWith.id, stationId, choseSide(stationId));
        removeStationIfFull(stationId, stations, stationsKeys);
        break;
      }

      if (!isKnown) continue;
      if (worker.visited_stations?.includes(stationId)) continue;

      assignWorkerToStation(worker.id, stationId, choseSide(stationId));
      removeStationIfFull(stationId, stations, stationsKeys);
      break;
    }
  }

  const workersStore = useWorkersStore();
  availableWorkers.forEach((worker) =>{
    const forMonth = -124;

    workersStore.setWorkerHistory(worker.id, worker.current_station, date);
    if(worker.station_history?.length >= 124) worker.station_history = worker.station_history.slice(forMonth);
  }
  );

  if (stationsKeys.length) stationsStore.enable_extra = true;
  if (!stationsKeys.length && stationsStore.enable_extra) stationsStore.enable_extra = false;

  return {
    snp_workers:cloneDeep(toRaw(workersStore.workers)),
    snp_assignments: cloneDeep(toRaw(stationsStore.assignments)),
  };
};

export { generateSchedule };
