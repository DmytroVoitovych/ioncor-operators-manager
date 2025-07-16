import shuffle from "lodash.shuffle";
import { Operator, StationNumber } from "~/maintypes/types";
import {
  findWorkerAsLastResort,
  getSuitableWorkersForReplacement,
} from "./workerReplacementService";
import { assignWorkerToStation, removePersonFromStation } from "./stationAssignmentService";
import { useStationsStore } from "~/store/stations";
import { useWorkersStore } from "~/store/workers";
//  const firstW =   availableWorkers.filter(e=>e.known_stations.includes('130')).toSorted(
//       (a, b) =>
//         a.station_history?.filter((st) => st.station === "130").length -
//         b.station_history?.filter((st) => st.station === "130").length,
//     )[0]; experimental if some problem will be detected sort will be removed

const generateSchedule = (
  stationsStore: ReturnType<typeof useStationsStore>,
  availableWorkers: Operator[],
  stations: Record<StationNumber, number>,
) => {
   const firstW =   availableWorkers.filter(e=>e.known_stations.includes('130')).toSorted(
      (a, b) =>
        a.station_history?.filter((st) => st.station === "130").length -
        b.station_history?.filter((st) => st.station === "130").length,
    )[0];

  const workersList = new Set(availableWorkers);

  stationsStore.assignments = {};
  workersList.forEach((worker) => (worker.current_station = "unassigned"));
  const stationsKeys: StationNumber[] = ['130',...shuffle(Object.keys(stations) as StationNumber[]).filter(e=> e !== '130')];


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

   assignWorkerToStation(firstW.id, '130', 'right');
   removeStationIfFull('130', stations, stationsKeys);
   workersList.delete(firstW);



   for (const worker of workersList) {

    for (let i = 0; i < stationsKeys.length; i++) {
      const stationId: StationNumber = stationsKeys[i];
      // const worker = availableWorkers[index];
      const isKnown = worker.known_stations.includes(stationId as StationNumber);
      const hardStationLimit = Math.ceil(14 / worker.known_stations.length) < 2?2:Math.ceil(14 / worker.known_stations.length);

       if(worker?.visited_stations?.filter(e=> e === '130').length === hardStationLimit && stationId === '130' ){


      };

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

              // added test for exluded 130
            const stp = possibleStations.find((st) => stationsKeys.includes(st) && st !== '130');
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

      if ((worker.visited_stations?.includes(stationId) && i === stationsKeys.length - 1)) {
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

            // added test for exluded 130
            const stp = possibleStations.find((st) => stationsKeys.includes(st) && st !== '130');

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

};

export { generateSchedule };
