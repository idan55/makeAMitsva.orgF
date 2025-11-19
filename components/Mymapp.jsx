import React from "react";
import Map, { Marker } from "react-map-gl";

export default function MyMap() {
  return (
    <Map
      initialViewState={{
        longitude: -93.118,
        latitude: 44.9453,
        zoom: 12
      }}
      mapboxAccessToken="pk.eyJ1IjoiZG9kb3YiLCJhIjoiY21pNXpjOXR5MjR2NzJpczUxamJ4eGg0YSJ9.Lz91JboxvuSrrXloSNuGUg"
      mapStyle="mapbox://styles/mapbox/streets-v12"
      style={{ width: "100%", height: "500px" }}
    >
      <Marker longitude={-93.118} latitude={44.9453} />
    </Map>
  );
}

