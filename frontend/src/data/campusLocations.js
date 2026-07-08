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
];
