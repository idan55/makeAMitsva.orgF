// pages/Myaccount.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Graph from "../components/Graph";
import { useAuth } from "../src/Authcontext";
import {
  getMyOpenRequests,
  getRequestsISolved,
  completeRequest,
  getMe,
} from "../src/Api";

function Myaccount() {
  const { user, login } = useAuth();
  const [myOpenRequests, setMyOpenRequests] = useState([]);
  const [mySolvedForOthers, setMySolvedForOthers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view your account.");
          setLoading(false);
          return;
        }

        const [openData, solvedData] = await Promise.all([
          getMyOpenRequests(token),
          getRequestsISolved(token),
        ]);

        setMyOpenRequests(openData.requests || []);
        setMySolvedForOthers(solvedData.requests || []);
      } catch (err) {
        console.error("Myaccount load error:", err);
        setError(err.message || "Failed to load account data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleSolved(requestId) {
    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in");
        return;
      }

      await completeRequest(requestId, token);

      // Remove from open list
      setMyOpenRequests((prev) =>
        prev.filter((r) => r._id !== requestId)
      );

      // Refresh user so stars + coupon update in UI
      const updatedUser = await getMe(token);
      login({ user: updatedUser, token });
    } catch (err) {
      console.error("handleSolved error:", err);
      setError(err.message || "Failed to mark as solved");
    }
  }

  const stars = user?.stars ?? 0;
  const starsPercent = Math.min((stars / 500) * 100, 100);

  return (
    <div className="page-container">
      <Header />

      <div className="content">
        <h1>My Account</h1>

        {user && (
          <div style={{ marginBottom: "20px" }}>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>

            {/* ⭐ Stars progress bar */}
            <div style={{ marginTop: "20px" }}>
              <p>
                <strong>Stars:</strong> {stars} / 500
              </p>

              <div
                style={{
                  width: "100%",
                  height: "20px",
                  background: "#ddd",
                  borderRadius: "10px",
                  overflow: "hidden",
                  marginTop: "5px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${starsPercent}%`,
                    background: stars >= 500 ? "#4caf50" : "#2196f3",
                    transition: "0.4s ease",
                  }}
                ></div>
              </div>

              {/* 🎁 Coupon unlock message */}
              {stars >= 500 && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "12px 16px",
                    background: "#4caf50",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  🎉 Mazal tov! You earned a 100₪ coupon for יש חסד!
                </div>
              )}
            </div>
          </div>
        )}

        {loading && <p>Loading your requests...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <div
            style={{
              display: "flex",
              gap: "40px",
              alignItems: "flex-start",
              marginTop: "20px",
            }}
          >
            {/* LEFT SIDE - My open requests */}
            <div style={{ flex: 1 }}>
              <h2>My open requests</h2>
              {myOpenRequests.length === 0 && (
                <p>You have no open requests.</p>
              )}

              {myOpenRequests.map((req) => (
                <div
                  key={req._id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <strong>{req.title}</strong>
                  <div>
                    Posted: {new Date(req.createdAt).toLocaleString()}
                  </div>
                  <p>{req.description}</p>

                  {/* Only show "Solved" if there is a helper */}
                  {req.completedBy ? (
                    <button onClick={() => handleSolved(req._id)}>
                      Solved
                    </button>
                  ) : (
                    <p style={{ fontSize: "12px", color: "#666" }}>
                      No helper yet.
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT SIDE - Requests I solved for others */}
            <div style={{ flex: 1 }}>
              <h2>Requests I solved for others</h2>
              {mySolvedForOthers.length === 0 && (
                <p>You have not completed any requests yet.</p>
              )}

              {mySolvedForOthers.map((req) => (
                <div
                  key={req._id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <strong>{req.title}</strong>
                  <div>
                    Help seeker:{" "}
                    {req.createdBy?.name ||
                      req.createdBy?.email ||
                      "Unknown"}
                  </div>
                  <div>
                    Completed at:{" "}
                    {new Date(
                      req.updatedAt || req.createdAt
                    ).toLocaleString()}
                  </div>
                  <p>{req.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Graph/>

      <Footer />

 

    </div>
  );
}

export default Myaccount;
