export enum Status {
  AVAILABLE = "available",
  SICK_LEAVE = "sick-leave",
  VACATION = "vacation",
  DAY_OFF = "day-off",
  UNKNOWN = "unknown",
}

type StationId = `${number}` | `${number}${string}`;

interface StationMap {
  [key: StationId]: number;
}

interface StationCollection extends StationMap {
  addStation(name: string, requiredPeople: number): void;
  changeRequiredPeople(name: string, requiredPeople: number): void;
  removeStation(name: string): void;
}

export const STATIONS: StationCollection = {
  "100": 1,
  "120": 1,
  "130": 1,
  "150": 1,
  "160": 1,
  "170": 2,
  "190": 2,
  "190A": 1,
  "200": 2,
  "220": 2,
  "230": 1,
  "250": 2,
  "260": 2,
  "470": 1,

  addStation(name: StationId, requiredPeople: number) {
    this[name] = requiredPeople;
  },
  removeStation(name: StationId) {
    delete this[name];
  },
  changeRequiredPeople(name: StationId, requiredPeople: number) {
    this[name] = requiredPeople;
  },
};

type StationNumber = Exclude<
  keyof typeof STATIONS,
  "addStation" | "removeStation" | "changeRequiredPeople"
>;

// type RequiredPeople = (typeof STATIONS)[StationNumber];

type UserStatus = {
  status: Status;
};

type StationVisit = {
  station: StationNumber;
  date: Date;
};

type User = {
  id: string;
  name: string;
  surname: string;
  created_at: Date;
  updated_at: Date;
};

type Manager = User & {
  role: "manager";
};

type Operator = User & {
  role: "operator";
  status: Status;
  known_stations: StationNumber[];
  station_history: StationVisit[] | [];
  current_station: StationNumber;
  visited_stations: StationNumber[];
};

type UserCreationData = Pick<Operator, "name" | "surname" | "known_stations" | "status">;

export type {
  UserStatus,
  User,
  Manager,
  Operator,
  UserCreationData,
  StationNumber,
  StationId,
  StationMap,
};
