import { useState } from "react";
import Icon from "../components/Icon.jsx";
import "../css/pages/CampusMap.css";
import { campusLocations } from "../data/campusLocations.js";

function CampusMap() {
  const [showGrid, setShowGrid] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  function selectLocation(location) {
    const floor = location.floors[0];
    setSelectedLocation(location);
    setSelectedFloor(floor);
    setSelectedRoom(location.roomsByFloor[floor][0]);
  }

  function handleFloorChange(event) {
    const floor = event.target.value;
    setSelectedFloor(floor);
    setSelectedRoom(selectedLocation.roomsByFloor[floor][0]);
  }

  const roomOptions = selectedLocation
    ? (selectedLocation.roomsByFloor[selectedFloor] ?? [])
    : [];

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
                aria-label={location.roomCode}
              >
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
                    {selectedLocation.roomCode}
                  </h2>
                  <p className="campus-map-selected-room-card__room-type">
                    {selectedLocation.roomType}
                  </p>
                </header>
                <div className="campus-map-selected-room-card__details">
                  <label className="campus-map-detail-field" htmlFor="campus-map-floor">
                    <span className="campus-map-detail-field__label">Floor Number</span>
                    <select
                      id="campus-map-floor"
                      className="campus-map-select"
                      value={selectedFloor}
                      onChange={handleFloorChange}
                    >
                      {selectedLocation.floors.map((floor) => (
                        <option key={floor} value={floor}>
                          Floor {floor}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="campus-map-detail-field" htmlFor="campus-map-room">
                    <span className="campus-map-detail-field__label">Room Number</span>
                    <select
                      id="campus-map-room"
                      className="campus-map-select"
                      value={selectedRoom}
                      onChange={(event) => setSelectedRoom(event.target.value)}
                    >
                      {roomOptions.map((room) => (
                        <option key={room} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <footer className="campus-map-selected-room-card__footer">
                  <button
                    type="button"
                    className="campus-map-btn campus-map-btn--primary campus-map-selected-room-card__action-btn"
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
            <div className="campus-map-all-locations-card__list" />
          </section>
        </aside>
      </div>
    </div>
  );
}

export default CampusMap;
