import shuffle from "lodash.shuffle";
import { Operator, StationNumber } from "~/maintypes/types";
import { useWorkersStore } from "~/store/workers";
import { assignWorkerToStation } from "./stationAssignmentService";

const getSuitableWorkersForReplacement = (
  availableWorkers: Operator[],
  stationId: StationNumber,
  possibleStations: StationNumber[],
  id: string,
) => {
  const workersWhoKnowBothStations = availableWorkers.filter(
    (e) =>
      e.known_stations.includes(stationId) && //if worker knows the station
      e.known_stations.some((s) => possibleStations.includes(s)) &&
      e.id !== id, //if worker knows one of the possible stations and is not the current worker
  );

  const idealWorker = workersWhoKnowBothStations.find(
    (e) =>
      possibleStations.includes(e.current_station) && //if worker is at a possible station
      !e.visited_stations?.includes(stationId), //if worker has not visited the station yet
  );

  return idealWorker;
};

const findWorkerAsLastResort = (
  worker: Operator,
  stationId: StationNumber,
  availableWorkers: Operator[],
  possibleStations: StationNumber[],
) => {
  const workerVSt = worker.visited_stations; // added test for exluded 130
  const giveNotLastVisited = (e: StationNumber) => e !== workerVSt.at(-1) && e !== "130";

  const preventRepeat = shuffle(workerVSt.filter(giveNotLastVisited));

  const giveStaions = preventRepeat.length
    ? preventRepeat
    : shuffle(worker.known_stations.filter(giveNotLastVisited));

  possibleStations.splice(0, possibleStations.length);
  possibleStations.push(...giveStaions);

  const checkStForPossibleAndKnown = (e: Operator) =>
    e.known_stations.includes(stationId) && possibleStations.includes(e.current_station);

  const newReplaceWith =
    availableWorkers.find(
      (e) => checkStForPossibleAndKnown(e) && !e.visited_stations?.includes(stationId),
    ) ||
    availableWorkers
      .filter(checkStForPossibleAndKnown)
      .toSorted(
        (a, b) =>
          a.station_history.filter((e) => e.station === stationId).length -
          b.station_history.filter((e) => e.station === stationId).length,
      )[0];

   return newReplaceWith;
};

const findWorkerForSwap = (
  stationId: StationNumber,
  availableWorkers: Operator[],
  possibleStations: StationNumber[],
) =>
  availableWorkers
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

export { getSuitableWorkersForReplacement, findWorkerAsLastResort, findWorkerForSwap };
