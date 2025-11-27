import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function Map({ userPos, requests, selectedId, onSelectRequest }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({}); // Store all markers by request ID

  // Initialize map once
  useEffect(() => {
    if (map.current) return; // Map already initialized

    const defaultPosition = userPos || [34.7818, 32.0853]; // [lng, lat]

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: defaultPosition,
      zoom: 13,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
  }, []);

  // Center on user position when it becomes available
  useEffect(() => {
    if (!map.current || !userPos) return;
    
    const [lat, lng] = userPos;
    map.current.setCenter([lng, lat]);
    map.current.setZoom(14);
  }, [userPos]);

  // Add user marker
  useEffect(() => {
    if (!map.current || !userPos) return;

    const [lat, lng] = userPos;

    // Create user marker (blue)
    const userMarker = new mapboxgl.Marker({ color: "blue" })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          "<strong>You are here</strong>"
        )
      )
      .addTo(map.current);

    return () => userMarker.remove();
  }, [userPos]);

  // Add request markers
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    Object.values(markers.current).forEach((marker) => marker.remove());
    markers.current = {};

    // Add new markers for each request
    requests.forEach((req) => {
      if (!req.location || !req.location.coordinates) return;

      const [lng, lat] = req.location.coordinates;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 5px;">
          <strong>${req.title}</strong><br/>
          Age: ${req.createdBy?.age ?? "N/A"}<br/>
          Posted: ${new Date(req.createdAt).toLocaleString()}
        </div>
      `);

      const marker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      // Click on marker to select it
      marker.getElement().addEventListener("click", () => {
        if (onSelectRequest) {
          onSelectRequest(req._id);
        }
      });

      markers.current[req._id] = marker;
    });

    return () => {
      Object.values(markers.current).forEach((marker) => marker.remove());
    };
  }, [requests, onSelectRequest]);

  // Focus on selected request (center + open popup)
  useEffect(() => {
    if (!map.current || !selectedId) return;

    const req = requests.find((r) => r._id === selectedId);
    if (!req || !req.location || !req.location.coordinates) return;

    const [lng, lat] = req.location.coordinates;

    // 🔥 Never zoom out: keep current zoom or zoom in to at least 15
    const currentZoom = map.current.getZoom();
    const targetZoom = Math.max(currentZoom, 15);

    // Fly to the selected marker
    map.current.flyTo({
      center: [lng, lat],
      zoom: targetZoom,
      essential: true,
    });

    // Open the popup for the selected marker
    const marker = markers.current[selectedId];
    if (marker) {
      marker.togglePopup(); // Open popup
    }
  }, [selectedId, requests]);

  return (
    <div
      ref={mapContainer}
      className="map-container-style"
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    />
  );
}

export default Map;