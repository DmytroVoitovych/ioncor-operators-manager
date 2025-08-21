import shuffle from "lodash.shuffle";
import { Operator, StationNumber } from "~/maintypes/types";

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

  const idealWorker = shuffle(
    workersWhoKnowBothStations.filter(
      (e) =>
        possibleStations.includes(e.current_station) && //if worker is at a possible station
        !e.visited_stations?.includes(stationId), //if worker has not visited the station yet
    ),
  ).toSorted((a, b) => {
    const visitsA = a.station_history.filter((st) => st.station === stationId).length;
    const visitsB = b.station_history.filter((st) => st.station === stationId).length;
    return visitsA - visitsB;
  })[0];

  return idealWorker;
};

const findWorkerAsLastResort = (
  worker: Operator,
  stationId: StationNumber,
  availableWorkers: Operator[],
  possibleStations: StationNumber[],
) => {
  const workerVSt = worker.known_stations; // added test for exluded 130
  const giveNotLastVisited = (e: StationNumber) =>
    e !== "130" && worker.station_history.at(-1)?.station !== e;

  const preventRepeat = shuffle(workerVSt.filter(giveNotLastVisited)).toSorted((a, b) => {
    const visitsA = worker.station_history.filter((st) => st.station === a).length;
    const visitsB = worker.station_history.filter((st) => st.station === b).length;
    return visitsA - visitsB;
  });

  const giveStaions = preventRepeat.length
    ? preventRepeat
    : worker.known_stations.filter(giveNotLastVisited);

  possibleStations.splice(0, possibleStations.length);
  possibleStations.push(...new Set(giveStaions));

  const checkStForPossibleAndKnown = (e: Operator) =>
    e.known_stations.includes(stationId) &&
    possibleStations.includes(e.current_station) &&
    e.station_history.at(-1)?.station !== stationId;

  const newReplaceWith =
    availableWorkers.find(
      (e) =>
        checkStForPossibleAndKnown(e) &&
        !e.visited_stations?.includes(stationId) &&
        e.station_history.at(-1)?.station !== stationId,
    ) ||
    shuffle(availableWorkers.filter(checkStForPossibleAndKnown)).toSorted(
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
) => {
  const worker = shuffle(
    availableWorkers.filter(
      (e) =>
        e.known_stations.includes(stationId) &&
        !e.visited_stations.at(-1)?.includes(stationId) &&
        e.known_stations.some((e) => possibleStations.includes(e)) &&
        e.station_history.at(-1)?.station !== stationId,
    ),
  ).toSorted(
    (a, b) =>
      a.station_history.filter((e) => e.station === stationId).length -
      b.station_history.filter((e) => e.station === stationId).length,
  )[0];

  return worker;
};

export { getSuitableWorkersForReplacement, findWorkerAsLastResort, findWorkerForSwap };
