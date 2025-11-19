import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function SetViewOnLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 15);
    }
  }, [coords]);
  return null;
}

function Mymapp() {
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Erreur :", err)
    );
  }, []);

  const defaultPosition = [48.8566, 2.3522];

  return (
    <div className="map-container-style">
      <MapContainer 
        center={defaultPosition} 
        zoom={13}
        className="map-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <SetViewOnLocation coords={userPos} />

        {userPos && (
          <Marker position={userPos}>
            <Popup>📍 Vous êtes ici !</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default Mymapp;
