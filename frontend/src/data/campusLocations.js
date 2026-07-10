export function locationHasRoomSelection(location) {
  return location?.hasRoomSelection === true;
}

export function createBuildingLocation({
  id,
  building,
  col,
  row,
  floors,
}) {
  return {
    id,
    building,
    col,
    row,
    hasRoomSelection: true,
    floors,
  };
}

export function createOpenLocation({ id, building, col, row }) {
  return {
    id,
    building,
    col,
    row,
    hasRoomSelection: false,
  };
}

export const campusLocations = [
  createBuildingLocation({
    id: "alingal-building",
    building: "Alingal Bldg.",
    col: 15,
    row: 10,
    floors: ["1", "2", "3", "4", "5"],
  }),
  createBuildingLocation({
    id: "phelan-building",
    building: "Phelan Bldg.",
    col: 7,
    row: 7,
    floors: ["1", "2", "3"],
  }),
  createOpenLocation({
    id: "covered-court",
    building: "Covered Court",
    col: 16,
    row: 14,
  }),
  createBuildingLocation({
    id: "xavier-hall",
    building: "Xavier Hall",
    col: 4,
    row: 11,
    floors: ["1", "2"],
  }),
  createBuildingLocation({
    id: "santos-building",
    building: "Santos Bldg.",
    col: 8,
    row: 9,
    floors: ["1", "2", "3"],
  }),
  createBuildingLocation({
    id: "burns-building",
    building: "Burns Bldg.",
    col: 11,
    row: 12,
    floors: ["1", "2", "3"],
  }),
  createBuildingLocation({
    id: "library",
    building: "Library",
    col: 12,
    row: 7,
    floors: ["1", "2", "3"],
  }),
  createBuildingLocation({
    id: "bonoan-building",
    building: "Bonoan Bldg.",
    col: 13,
    row: 10,
    floors: ["1", "2", "3", "4"],
  }),
  createOpenLocation({
    id: "richie-sj-hall",
    building: "Richie Fernando Hall",
    col: 14,
    row: 9,
  }),
  createBuildingLocation({
    id: "dolan-building",
    building: "Dolan Bldg.",
    col: 9,
    row: 4,
    floors: ["1", "2", "3", "4"],
  }),
  createBuildingLocation({
    id: "madrigal-building",
    building: "Madrigal Bldg.",
    col: 12,
    row: 13,
    floors: ["1", "2", "3"],
  }),
  createBuildingLocation({
    id: "ricci-sj-hall",
    building: "Ricci Hall",
    col: 13,
    row: 13,
    floors: ["1", "2"],
  }),
  createBuildingLocation({
    id: "arrupe-building",
    building: "Arrupe Bldg.",
    col: 15,
    row: 6,
    floors: ["1", "2", "3"],
  }),
  createBuildingLocation({
    id: "belardo-shs-building",
    building: "SHS Bldg.",
    col: 5,
    row: 5,
    floors: ["1", "2", "3", "4", "5"],
  }),
  createBuildingLocation({
    id: "engineering-building",
    building: "Engineering Bldg.",
    col: 6,
    row: 4,
    floors: ["1", "2", "3"],
  }),
  createBuildingLocation({
    id: "administration-building",
    building: "Administration Bldg.",
    col: 9,
    row: 11,
    floors: ["1", "2"],
  }),
  createOpenLocation({
    id: "university-gymnasium",
    building: "University Gymnasium",
    col: 3,
    row: 9,
  }),
  createOpenLocation({
    id: "xavier-grounds",
    building: "Xavier Grounds",
    col: 5,
    row: 13,
  }),
  createOpenLocation({
    id: "church-grounds",
    building: "Church Grounds",
    col: 7,
    row: 15,
  }),
  createOpenLocation({
    id: "ignatius-park",
    building: "Ignatius Park",
    col: 11,
    row: 9,
  }),
];
