import shuffle from "lodash.shuffle";
import { Operator, StationNumber } from "~/maintypes/types";
import {
  findWorkerAsLastResort,
  getSuitableWorkersForReplacement,
} from "./workerReplacementService";
import { assignWorkerToStation, removePersonFromStation } from "./stationAssignmentService";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";

const generateSchedule = (
  stationsStore: ReturnType<typeof useStationsStore>,
  availableWorkers: Operator[],
  stations: Record<StationNumber, number>,
) => {
  stationsStore.assignments = {};
  availableWorkers.forEach((worker) => (worker.current_station = "unassigned"));
  const stationsKeys: StationNumber[] = shuffle(Object.keys(stations) as StationNumber[]);

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

  for (let index = 0; index < availableWorkers.length; index++) {
    for (let i = 0; i < stationsKeys.length; i++) {
      const stationId: StationNumber = stationsKeys[i];
      const worker = availableWorkers[index];
      const isKnown = worker.known_stations.includes(stationId as StationNumber);

      // if(worker.current_station !== 'unassigned') {
      //   debugger;
      //   continue outer;}
      if (i === stationsKeys.length - 1 && !isKnown) {
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
            const test = availableWorkers
              .filter(
                (e) =>
                  e.known_stations.includes(stationId) &&
                  !e.visited_stations.at(-1)?.includes(stationId) &&
                  e.known_stations.some((e) => possibleStations.includes(e)),
              )
              .toSorted(
                (a, b) =>
                  a.station_history.filter((e) => e.station === stationId).length -
                  b.station_history.filter((e) => e.station === stationId).length,
              )[0];

            const stp = possibleStations.find((st) => stationsKeys.includes(st));
            //  console.log(stp,possibleStations);
            //  useWorkersStore().setCurrentStation(test.id,stp);
            if (!stationsKeys.includes(stp)) {
              //!!!!!!!!!!!!!!!
              if (!test) debugger;
               removePersonFromStation(test?.id, stationId);
          assignWorkerToStation(
            worker.id,
            test.current_station,
            choseSide(test.current_station),
          );
          assignWorkerToStation(test.id, stationId, choseSide(stationId));
          removeStationIfFull(stationId, stations, stationsKeys);
          break;

            }
            assignWorkerToStation(worker.id, stp, choseSide(stp));
            removeStationIfFull(stp, stations, stationsKeys);
            //  debugger;

            // generateSchedule(stationsStore, availableWorkers, stations);
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

      if (worker.visited_stations?.includes(stationId) && i === stationsKeys.length - 1) {
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
            const test = availableWorkers
              .filter(
                (e) =>
                  e.known_stations.includes(stationId) &&
                  !e.visited_stations.at(-1)?.includes(stationId) &&
                  e.known_stations.some((e) => possibleStations.includes(e)),
              )
              .toSorted(
                (a, b) =>
                  a.station_history.filter((e) => e.station === stationId).length -
                  b.station_history.filter((e) => e.station === stationId).length,
              )[0];

            const stp = possibleStations.find((st) => stationsKeys.includes(st));

            if (!stationsKeys.includes(stp)) {
              //!!!!!!!!!!!!!!!
                if (!test) debugger;
               removePersonFromStation(test?.id, stationId);
          assignWorkerToStation(
            worker.id,
            test.current_station,
            choseSide(test.current_station),
          );
          assignWorkerToStation(test.id, stationId, choseSide(stationId));
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

      if (worker.visited_stations?.includes(stationId)) continue;

      assignWorkerToStation(worker.id, stationId, choseSide(stationId));
      removeStationIfFull(stationId, stations, stationsKeys);
      break;
    }
  }
  if (!stationsKeys.length) {
    const workersStore = useWorkersStore();
    availableWorkers.forEach((worker) =>
      workersStore.setWorkerHistory(worker.id, worker.current_station),
    );
  }
  console.log(
    availableWorkers
      .filter((e) => e.known_stations.includes("130"))
      .map(
        (e) =>
          `${e.name + "" + e.surname}:${e.station_history.slice(-20).filter((st) => st.station === "130").length}:known${e.known_stations.length}`,
      ),
  );
};

export { generateSchedule };
