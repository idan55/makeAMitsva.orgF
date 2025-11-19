import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Mymapp() {
  const position = [48.8566, 2.3522]; // Coordonnées Paris

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            📍 Tu es ici !
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Mymapp;