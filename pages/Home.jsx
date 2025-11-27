import React, { useEffect, useState, useRef } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Map from "../components/Map";
import {
  createRequest,
  getNearbyRequests,
  wantToHelpRequest,
  completeRequest,
} from "../src/Api";
import { useAuth } from "../src/Authcontext";

function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
===  const [success, setSuccess] = useState("");

  const [userPos, setUserPos] = useState(null); // [lat, lng]
  const [radiusKm, setRadiusKm] = useState(5);
  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedId, setSelectedId] = useState(null); // ONE selected request

  const { user } = useAuth();


  // refs for each request item in the list
  const itemRefs = useRef({});

  // Create a request
  async function handleCreateRequest(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("You must be logged in to create a request");
      return;
    }
    
    if (!userPos) {
      alert("Location not ready yet");
      return;
    }
    
    try {
      setError("");
      setSuccess("");
      const [lat, lng] = userPos;
      const data = await createRequest({
        title,
        description,
        latitude: lat,
        longitude: lng,
        token,
      }); // { message, request }

      setRequests((prev) => [...prev, data.request]);
      setTitle("");
      setDescription("");
      setSuccess(data.message || "Request successfully created ✅");
    } catch (err) {
      console.error("Error creating request:", err);
      setError(err.message || "Failed to create request");
      setSuccess("");
    }
  }

  // Helper: "I want to help"
  async function handleWantToHelp(requestId, e) {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to help");
      return;
    }

    try {
      setError("");
      const data = await wantToHelpRequest(requestId, token);
      // replace that request in state
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? data.request : r))
      );
    } catch (err) {
      console.error("wantToHelp error:", err);
      setError(err.message || "Failed to mark as helper");
    }
  }

  // Creator: "Mark as completed"
  async function handleMarkCompleted(requestId, e) {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in");
      return;
    }

    try {
      setError("");
      const data = await completeRequest(requestId, token);
      // replace that request in state
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? data.request : r))
      );
    } catch (err) {
      console.error("markCompleted error:", err);
      setError(err.message || "Failed to mark as completed");
    }
  }

  // Get user’s location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error(err);
        setError("Could not get your location");
      }
    );
  }, []);

  // Fetch nearby requests on location or radius change
  useEffect(() => {
    async function loadRequests() {
      if (!userPos) return;
      
      try {
        setLoading(true);
        setError("");
        
        const [lat, lng] = userPos;
        const data = await getNearbyRequests({
          latitude: lat,
          longitude: lng,
          distanceKm: radiusKm,
        });
        
        setRequests(data.requests || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load nearby requests");
      } finally {
        setLoading(false);
      }
    }
    
    loadRequests();
  }, [userPos, radiusKm]);

  // Called from map and from list
  function handleSelectRequest(id) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  // Auto-scroll to selected card when selectedId changes
  useEffect(() => {
    if (!selectedId) return;
    
    const el = itemRefs.current[selectedId];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedId]);

  return (
    <div className="page-container">
      <Header />
      <div className="content">
        <h2>Nearby Mitzvot</h2>

        {/* Radius slider */}
        <div style={{ marginBottom: "20px" }}>
          <label>
            Distance: {radiusKm} km
            <input
              type="range"
              min="1"
              max="20"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              style={{ marginLeft: "10px", width: "200px" }}
            />
          </label>
          <button
            onClick={() => {
              setRadiusKm(20000);
            }}
          >
            Global requests
          </button>
        </div>

        {/* Create request */}
        <form onSubmit={handleCreateRequest} style={{ marginBottom: "20px" }}>
          <h3>Add a new request</h3>
          <input
            type="text"
            placeholder="Title (max 10 characters)"
            maxLength={10}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ 
              width: "100%", 
              padding: "10px", 
              marginBottom: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc"
            }}
          />
          <textarea
            placeholder="Description (max 200 characters)"
            maxLength={200}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ 
              width: "100%", 
              padding: "10px", 
              marginBottom: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              minHeight: "80px"
            }}
          />
          <button 
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Create request
          </button>
        </form>

        {/* Feedback messages */}
        {success && (
          <p style={{ color: "green", marginTop: "10px", fontWeight: "bold" }}>
            {success}
          </p>
        )}
        {error && (
          <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
            {error}
          </p>
        )}
        {loading && <p>Loading nearby mitzvot...</p>}

        {/* Map + scroll list */}
        {userPos && (
          <div 
            className="map-window-wrapper"
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "20px"
            }}
          >
            {/* MAP */}
            <div 
              className="map-wrapper"
              style={{ flex: "1 1 60%" }}
            >
              <Map
                userPos={userPos}
                requests={requests}
                selectedId={selectedId}
                onSelectRequest={handleSelectRequest}
              />
            </div>

            {/* SCROLL LIST */}
            <div 
              className="window-wrapper"
              style={{ flex: "1 1 40%" }}
            >
              <h3>Nearest requests</h3>
              <div 
                className="request-list"
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "10px"
                }}
              >
                {requests.length === 0 && (
                  <p>No requests found in this radius.</p>
                )}
                {requests.map((req) => {
                  const isExpanded = selectedId === req._id;
                  const currentUserId = user?.id || user?._id;
                  const creatorId = req.createdBy?._id || req.createdBy;
                  const helperId = req.completedBy?._id || req.completedBy;

                  const isOwner = currentUserId && creatorId === currentUserId;
                  const isHelper = currentUserId && helperId === currentUserId;

                  return (
                    <div
                      key={req._id}
                      ref={(el) => {
                        itemRefs.current[req._id] = el;
                      }}
                      className="request-item"
                      onClick={() => handleSelectRequest(req._id)}
                      style={{
                        padding: "15px",
                        marginBottom: "10px",
                        border: isExpanded ? "2px solid #007bff" : "1px solid #ddd",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: isExpanded ? "#f0f8ff" : "white",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <strong>{req.title}</strong>
                      <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
                        Age: {req.createdBy?.age ?? "N/A"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#999", marginTop: "3px" }}>
                        Posted: {new Date(req.createdAt).toLocaleString()}
                      </div>
                      {req.distance != null && (
                        <div>
                          Distance: {(req.distance / 1000).toFixed(2)} km
                        </div>
                      )}

                      {req.isCompleted && (
                        <div style={{ color: "green", fontWeight: "bold" }}>
                          Solved ✓
                        </div>
                      )}

                      {isExpanded && (
                        <>
                          <hr />
                          <p>{req.description}</p>

                          {/* Helper button: only for non-owners on open requests */}
                          {!isOwner && !req.isCompleted && (
                            <button
                              type="button"
                              onClick={(e) => handleWantToHelp(req._id, e)}
                            >
                              I want to help
                            </button>
                          )}

                          {/* Owner button: only for creator on open requests */}
                          {isOwner && !req.isCompleted && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkCompleted(req._id, e)}
                            >
                              Mark as completed
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Open chat for", req._id);
                            }}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "bold"
                            }}
                          >
                            Open chat
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Home;