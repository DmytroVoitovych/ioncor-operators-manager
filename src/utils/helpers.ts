import { Status } from "~/maintypes/types";

const STATUS_COLORS: Record<Status, string> = {
  [Status.AVAILABLE]: "#10B981", // green
  [Status.SICK_LEAVE]: "#EF4444", // red
  [Status.VACATION]: "#3B82F6", // blue
  [Status.DAY_OFF]: "#F59E0B", // orange
  [Status.UNKNOWN]: "#6B7280", // gray
};

const getStatusColor = (status: Status): string =>
  STATUS_COLORS[status] || STATUS_COLORS[Status.UNKNOWN];

export { getStatusColor };
