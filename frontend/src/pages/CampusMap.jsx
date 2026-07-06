import "../css/pages/CampusMap.css";
const SELECTED_ROOM_PLACEHOLDER = {
  roomCode: "AL212",
  roomType: "Classroom",
};

function CampusMap() {
  return (
    <div className="campus-map-page">
      <div className="campus-map-layout">
        <section
          className="campus-map-view-container"
          aria-label="Campus map"
        >
          <div className="campus-map-canvas">
            <img
              src="/adnu-campus-map.png"
              alt="ADNU campus map"
              className="campus-map-image"
            />
          </div>
        </section>

        <aside
          className="campus-map-sidebar"
          aria-label="Room details and locations"
        >
          <section className="campus-map-selected-room-card">
            <header className="campus-map-selected-room-card__header">
              <h2 className="campus-map-selected-room-card__room-code">
                {SELECTED_ROOM_PLACEHOLDER.roomCode}
              </h2>
              <p className="campus-map-selected-room-card__room-type">
                {SELECTED_ROOM_PLACEHOLDER.roomType}
              </p>
            </header>
            <div className="campus-map-selected-room-card__details" />
            <footer className="campus-map-selected-room-card__footer">
              <button
                type="button"
                className="campus-map-btn campus-map-btn--primary campus-map-selected-room-card__action-btn"
              >
                Propose Schedule Here
              </button>
            </footer>
          </section>

          <section className="campus-map-all-locations-card">
            <header className="campus-map-all-locations-card__header">
              <h2 className="campus-map-all-locations-card__title">
                All Locations
              </h2>
            </header>
            <div className="campus-map-all-locations-card__list" />
          </section>
        </aside>
      </div>
    </div>
  );
}

export default CampusMap;
