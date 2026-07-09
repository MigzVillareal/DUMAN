import { useMemo, useState } from "react";
import Icon from "../components/Icon.jsx";
import "../css/pages/CampusMap.css";
import CreateMeetingModal from "../components/CreateMeetingModal.jsx";
import { useGroups } from "../context/GroupsContext.jsx";
import { createMeeting } from "../services/meetingService.js";
import { campusLocations, getRoomsForFloor, locationHasRoomSelection } from "../data/campusLocations.js";

function CampusMap() {
  const { groups } = useGroups();
  const [showGrid, setShowGrid] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);

  function selectLocation(location) {
    setSelectedLocation(location);

    if (locationHasRoomSelection(location)) {
      const floor = location.floors[0];
      setSelectedFloor(floor);
      setSelectedRoom(location.roomsByFloor[floor][0]);
      return;
    }

    setSelectedFloor("");
    setSelectedRoom("");
  }

  function handleFloorChange(event) {
    const floor = event.target.value;
    setSelectedFloor(floor);
    const rooms = getRoomsForFloor(selectedLocation, floor);
    setSelectedRoom(rooms?.[0] ?? "");
  }

  const hasRoomSelection = selectedLocation
    ? locationHasRoomSelection(selectedLocation)
    : false;
  const roomOptions = hasRoomSelection
    ? (getRoomsForFloor(selectedLocation, selectedFloor) ?? [])
    : null;

  const filteredLocations = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();
    if (!query) return campusLocations;

    return campusLocations.filter((location) =>
      location.building.toLowerCase().includes(query)
    );
  }, [locationSearch]);

  return (
    <div className="campus-map-page">
      <div className="campus-map-layout">
        <section className="campus-map-view-container" aria-label="Campus map">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            aria-pressed={showGrid}
          >
            {showGrid ? "Hide Grid" : "Show Grid"}
          </button>

          <div className="campus-map-canvas">
            <img
              src="/adnu-campus-map.png"
              alt="ADNU campus map"
              className="campus-map-image"
            />

            {showGrid && <div className="campus-map-grid" aria-hidden="true" />}

            {campusLocations.map((location) => (
              <button
                key={location.id}
                type="button"
                className={`campus-map-pin${selectedLocation?.id === location.id ? " campus-map-pin--active" : ""}`}
                style={{
                  left: `${((location.col - 0.5) / 20) * 100}%`,
                  top: `${((location.row - 0.5) / 20) * 100}%`,
                }}
                onClick={() => selectLocation(location)}
                aria-label={location.building}
              >
                <span className="campus-map-pin__tooltip" role="tooltip">
                  {location.building}
                </span>
                <Icon icon="location-dot" size="lg" />
              </button>
            ))}
          </div>
        </section>

        <aside className="campus-map-sidebar" aria-label="Room details and locations">
          <section className="campus-map-selected-room-card">
            {selectedLocation ? (
              <>
                <header className="campus-map-selected-room-card__header">
                  <h2 className="campus-map-selected-room-card__room-code">
                    {selectedLocation.building}
                  </h2>
                </header>
                <div className="campus-map-selected-room-card__details">
                  <label className="campus-map-detail-field" htmlFor="campus-map-floor">
                    <span className="campus-map-detail-field__label">Floor Number</span>
                    <select
                      id="campus-map-floor"
                      className="campus-map-select"
                      value={hasRoomSelection ? selectedFloor : ""}
                      onChange={handleFloorChange}
                      disabled={!hasRoomSelection}
                    >
                      {hasRoomSelection ? (
                        selectedLocation.floors.map((floor) => (
                          <option key={floor} value={floor}>
                            Floor {floor}
                          </option>
                        ))
                      ) : (
                        <option value="">Not applicable</option>
                      )}
                    </select>
                  </label>

                  <label className="campus-map-detail-field" htmlFor="campus-map-room">
                    <span className="campus-map-detail-field__label">Room Number</span>
                    <select
                      id="campus-map-room"
                      className="campus-map-select"
                      value={hasRoomSelection ? selectedRoom : ""}
                      onChange={(event) => setSelectedRoom(event.target.value)}
                      disabled={!hasRoomSelection}
                    >
                      {hasRoomSelection ? (
                        roomOptions.map((room) => (
                          <option key={room} value={room}>
                            {room}
                          </option>
                        ))
                      ) : (
                        <option value="">Not applicable</option>
                      )}
                    </select>
                  </label>
                </div>
                <footer className="campus-map-selected-room-card__footer">
                  <button
                    type="button"
                    className="campus-map-btn campus-map-btn--primary campus-map-selected-room-card__action-btn"
                    onClick={() => setShowCreateMeetingModal(true)}
                  >
                    Create Meeting Here
                  </button>
                </footer>
              </>
            ) : (
              <p className="campus-map-selected-room-card__instruction">
                Select a pin on the map to view building details.
              </p>
            )}
          </section>

          <section className="campus-map-all-locations-card">
            <header className="campus-map-all-locations-card__header">
              <h2 className="campus-map-all-locations-card__title">All Locations</h2>
            </header>
            <div className="campus-map-all-locations-card__search-wrap">
              <span className="campus-map-all-locations-card__search-icon">
                <Icon icon="search" size="sm" />
              </span>
              <input
                id="campus-map-locations-search"
                type="text"
                className="campus-map-all-locations-card__search"
                placeholder="Search locations..."
                value={locationSearch}
                onChange={(event) => setLocationSearch(event.target.value)}
              />
            </div>
            <ul className="campus-map-all-locations-card__list">
              {filteredLocations.length === 0 ? (
                <li className="campus-map-all-locations-card__empty">No locations found.</li>
              ) : (
                filteredLocations.map((location) => (
                  <li key={location.id}>
                    <button
                      type="button"
                      className={`campus-map-location-item${selectedLocation?.id === location.id ? " campus-map-location-item--active" : ""}`}
                      onClick={() => selectLocation(location)}
                    >
                      <span className="campus-map-location-item__name">{location.building}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </section>
        </aside>
      </div>

      {showCreateMeetingModal && selectedLocation && (
        <CreateMeetingModal
          groups={groups}
          fixedLocation={{
            locationId: selectedLocation.id,
            floor: selectedFloor,
            room: selectedRoom,
          }}
          onClose={() => setShowCreateMeetingModal(false)}
          onSubmit={async (data) => {
            await createMeeting(data);
          }}
        />
      )}
    </div>
  );
}

export default CampusMap;
