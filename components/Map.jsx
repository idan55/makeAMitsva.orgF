import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Petit composant interne pour déplacer la carte sur la position de l'utilisateur
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

  // Récupère la position dès l'arrivée sur le site
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error("Erreur de géolocalisation :", err);
      }
    );
  }, []);

  const defaultPosition = [48.8566, 2.3522]; // Position de base (Paris)

  return (
    <div style={{ height: "70vh", width: "70%" }}>
      <MapContainer 
        center={defaultPosition} 
        zoom={13} 
        style={{ height: "70%", width: "70%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Déplace la carte sur la position GPS */}
        <SetViewOnLocation coords={userPos} />

        {/* Affiche un marqueur si la position a été trouvée */}
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

