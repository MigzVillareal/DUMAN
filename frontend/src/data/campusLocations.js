export function locationHasRoomSelection(location) {
  return location?.hasRoomSelection === true;
}

export function getRoomsForFloor(location, floor) {
  if (!locationHasRoomSelection(location)) return null;
  return location.roomsByFloor[floor] ?? null;
}

export function createBuildingLocation({
  id,
  building,
  col,
  row,
  floors,
  roomsByFloor,
}) {
  return {
    id,
    building,
    col,
    row,
    hasRoomSelection: true,
    floors,
    roomsByFloor,
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
    building: "Alingal Building",
    col: 15,
    row: 10,
    floors: ["1", "2", "3", "4"],
    roomsByFloor: {
      "1": ["101", "102", "103", "104"],
      "2": ["201", "202", "203"],
      "3": ["301", "302"],
      "4": ["401"],
    },
  }),
  createBuildingLocation({
    id: "phelan-building",
    building: "Phelan Building",
    col: 7,
    row: 7,
    floors: ["1", "2", "3"],
    roomsByFloor: {
      "1": ["101", "102"],
      "2": ["201", "202", "203"],
      "3": ["301"],
    },
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
    floors: ["1", "2", "3"],
    roomsByFloor: {
      "1": ["101", "102", "103"],
      "2": ["201", "202", "203"],
      "3": ["301", "302"],
    },
  }),
  createBuildingLocation({
    id: "santos-building",
    building: "Santos Building",
    col: 8,
    row: 9,
    floors: ["1", "2", "3"],
    roomsByFloor: {
      "1": ["101", "102", "103"],
      "2": ["201", "202", "203"],
      "3": ["301", "302"],
    },
  }),
  createBuildingLocation({
    id: "burns-building",
    building: "Burns Building",
    col: 11,
    row: 12,
    floors: ["1", "2", "3"],
    roomsByFloor: {
      "1": ["101", "102", "103"],
      "2": ["201", "202", "203"],
      "3": ["301", "302"],
    },
  }),
  createBuildingLocation({
    id: "library",
    building: "Library",
    col: 12,
    row: 7,
    floors: ["1", "2", "3"],
    roomsByFloor: {
      "1": ["101", "102", "103"],
      "2": ["201", "202", "203"],
      "3": ["301", "302"],
    },
  }),
  createBuildingLocation({
    id: "bonoan-building",
    building: "Bonoan Building",
    col: 13,
    row: 10,
    floors: ["1", "2", "3"],
    roomsByFloor: {
      "1": ["101", "102", "103"],
      "2": ["201", "202", "204"],
      "3": ["301", "302"],
    },
  }),
  createBuildingLocation({
    id: "dolan-building",
    building: "Dolan Building",
    col: 9,
    row: 4,
    floors: ["1", "2", "3"],
    roomsByFloor: {
      "1": ["101", "102", "103"],
      "2": ["201", "202", "203"],
      "3": ["301", "302"],
    },
  }),
  createBuildingLocation({
    id: "madrigal-building",
    building: "Madrigal Building",
    col: 12,
    row: 13,
    floors: ["1", "2", "3"],
    roomsByFloor: {
      "1": ["101", "102", "103"],
      "2": ["201", "202", "203"],
      "3": ["301", "302"],
    },
  }),
  createBuildingLocation({
    id: "arrupe-building",
    building: "Arrupe Building",
    col: 15,
    row: 6,
    floors: ["1", "2", "3"],
    roomsByFloor: {
      "1": ["101", "102", "103"],
      "2": ["201", "202", "203"],
      "3": ["301", "302"],
    },
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
