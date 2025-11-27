import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const redIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Center on user position initially
function SetViewOnUser({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 14);
    }
  }, [coords, map]);
  return null;
}

// When a request is selected, center map on that pin AND open its popup
function FocusOnSelected({ requests, selectedId, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;

    const req = requests.find((r) => r._id === selectedId);
    if (!req || !req.location || !req.location.coordinates) return;

    const [lng, lat] = req.location.coordinates;
    const latlng = [lat, lng];

    // 🔥 Never zoom out: keep current zoom or zoom in to at least 15
    const currentZoom = map.getZoom();
    const targetZoom = Math.max(currentZoom, 15);

    map.setView(latlng, targetZoom);

    // open popup for that marker
    const marker = markerRefs.current[selectedId];
    if (marker && marker.openPopup) {
      marker.openPopup();
    }
  }, [selectedId, requests, map, markerRefs]);

  return null;
}

function Map({ userPos, requests, selectedId, onSelectRequest }) {
  const defaultPosition = userPos || [48.8566, 2.3522];

  // refs for each marker (by request id)
  const markerRefs = useRef({});


function AutoZoom({ requests }) {
  const map = useMap();

  if (requests.length > 0) {
    const bounds = L.latLngBounds(
      requests.map((req) => [
        req.location.coordinates[1],
        req.location.coordinates[0],
      ])
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }

  return null;
}

  return (
    <div className="map-container-style">
      <MapContainer center={defaultPosition} zoom={13} className="map-full">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* initial center on user */}
        <SetViewOnUser coords={userPos} />

        {/* center + open popup when a request is selected */}
        <FocusOnSelected
          requests={requests}
          selectedId={selectedId}
          markerRefs={markerRefs}
        />

        {/* user position */}
        {userPos && (
          <Marker position={userPos}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* requests */}
        {requests.map((req) => {
          const [lng, lat] = req.location.coordinates;
          const pos = [lat, lng];

          return (
            <Marker
              key={req._id}
              position={pos}
              icon={redIcon}
              ref={(marker) => {
                if (marker) {
                  markerRefs.current[req._id] = marker;
                }
              }}
              eventHandlers={{
                // clicking a pin selects it; Home handles list expand
                click: () => onSelectRequest && onSelectRequest(req._id),
              }}
            >
              <Popup>
                <strong>{req.title}</strong>
                <br />
                Age: {req.createdBy?.age ?? "N/A"}
                <br />
                Posted: {new Date(req.createdAt).toLocaleString()}
              </Popup>
            </Marker>
          );
        })}
        <AutoZoom requests={requests} />
      </MapContainer>
    </div>
  );
}

export default Map;
