import { Operator, StationNumber } from "~/maintypes/types";

const findWorkerById = (workers: Operator[], workerId: string): Operator | undefined =>
  workers.find((worker) => worker.id === workerId);

const isExtraAssignment = (assignedId: string | null): boolean => {
  return assignedId?.includes("Extra") ?? false;
};

const createOptimizedWorker = (worker:Operator) => {
  const forMonth = -124;

    if (!worker?.station_history?.length) return worker;
    return {
      ...worker,
      station_history: worker.station_history.slice(forMonth)
    };
  };

export { isExtraAssignment, findWorkerById, createOptimizedWorker };
