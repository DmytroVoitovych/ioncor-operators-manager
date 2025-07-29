import { Operator, StationNumber } from "~/maintypes/types";

const findWorkerById = (workers: Operator[], workerId: string): Operator | undefined =>
  workers.find((worker) => worker.id === workerId);
const isExtraAssignment = (assignedId: string | null): boolean => {
  return assignedId?.includes("Extra") ?? false;
};

export { isExtraAssignment, findWorkerById };
