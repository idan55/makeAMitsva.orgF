import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Graph from "../components/Graph";
import ChatWindow from "../components/ChatWindow/ChatWindow";
import { useAuth } from "../src/Authcontext";
import {
  getMyOpenRequests,
  getRequestsISolved,
  getMyCompletedRequests,
  completeRequest,
  getMe,
  startChat,
} from "../src/Api";

function Myaccount() {
  const { user, login } = useAuth();

  const [myOpenRequests, setMyOpenRequests] = useState([]);
  const [mySolvedForOthers, setMySolvedForOthers] = useState([]);
  const [myCompletedCreated, setMyCompletedCreated] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false); // ✅ Pour empêcher la boucle

  const [activeChat, setActiveChat] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

        const [openData, solvedData, completedCreatedData] = await Promise.all([
          getMyOpenRequests(token),
          getRequestsISolved(token),
          getMyCompletedRequests(token),
        ]);

        setMyOpenRequests(openData.requests || []);
        setMySolvedForOthers(solvedData.requests || []);
        setMyCompletedCreated(completedCreatedData.requests || []);
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
      setMyOpenRequests((prev) => prev.filter((r) => r._id !== requestId));

      const updatedUserData = await getMe(token);
      login(updatedUserData.user);
    } catch (err) {
      console.error("handleSolved error:", err);
      setError(err.message || "Failed to mark as solved");
    }
  }

  const handleOpenChat = async (request) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("You must be logged in to view chat.");
        return;
      }
      
      if (!user) {
        setError("No user in context.");
        return;
      }

      const currentUserId = user.id || user._id;
      const creatorId = request.createdBy?._id || request.createdBy;
      const helperId = request.completedBy?._id || request.completedBy || null;

      let otherUserId;
      let otherUserObj;

      if (currentUserId === creatorId && helperId) {
        otherUserId = helperId;
        otherUserObj = request.completedBy || null;
      } else if (helperId && currentUserId === helperId) {
        otherUserId = creatorId;
        otherUserObj = request.createdBy;
      } else {
        otherUserId = creatorId;
        otherUserObj = request.createdBy;
      }

      if (!otherUserId) {
        setError("No other user available in this chat.");
        return;
      }

      if (otherUserId === currentUserId) {
        setError("Cannot open chat with yourself.");
        return;
      }

      const data = await startChat({ otherUserId, token });

      setActiveChat({
        chatId: data.chatId,
        otherUser: otherUserObj,
        requestTitle: request.title,
        isReadOnly: true,
      });
      setIsChatOpen(true);
    } catch (err) {
      console.error("Error opening chat from Myaccount:", err);
      setError(err.message || "Failed to open chat");
    }
  };

  const stars = user?.stars ?? 0;
  const starsPercent = Math.min((stars / 500) * 100, 100);

  console.log("👤 Current user:", user);
  console.log("🖼️ Profile image:", user?.profileImage);

  return (
    <div className="page-container">
      <Header />
      <div className="content" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "30px", textAlign: "center" }}>My Account</h1>

        {user && (
          <div style={{ 
            marginBottom: "40px", 
            padding: "20px", 
            background: "#f9f9f9", 
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              {!imageError && user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name || "Profile"}
                  onError={() => {
                    console.error("❌ Image failed:", user.profileImage);
                    setImageError(true);
                  }}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #2196f3",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2196f3, #1976d2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "48px",
                    fontWeight: "bold",
                    border: "4px solid #2196f3",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    margin: "0 auto"
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
            </div>

            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "18px", marginBottom: "8px" }}>
                <strong>Name:</strong> {user.name}
              </p>
              <p style={{ fontSize: "16px", marginBottom: "8px", color: "#666" }}>
                <strong>Email:</strong> {user.email}
              </p>
              <p style={{ fontSize: "16px", color: "#666" }}>
                <strong>Phone:</strong> {user.phone}
              </p>
            </div>

            <div style={{ marginTop: "30px" }}>
              <p style={{ fontSize: "16px", marginBottom: "10px", textAlign: "center" }}>
                <strong>Stars:</strong> {stars} / 500
              </p>
              <div
                style={{
                  width: "100%",
                  height: "24px",
                  background: "#ddd",
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${starsPercent}%`,
                    background: stars >= 500 
                      ? "linear-gradient(90deg, #4caf50, #45a049)" 
                      : "linear-gradient(90deg, #2196f3, #1976d2)",
                    transition: "width 0.6s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "12px"
                  }}
                >
                  {starsPercent.toFixed(0)}%
                </div>
              </div>

              {stars >= 500 && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px 20px",
                    background: "linear-gradient(135deg, #4caf50, #45a049)",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "10px",
                    textAlign: "center",
                    fontSize: "16px",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)"
                  }}
                >
                  🎉 Mazal tov! You earned a 100₪ coupon for יש חסד!
                </div>
              )}
            </div>
          </div>
        )}

        {loading && <p style={{ textAlign: "center", fontSize: "16px" }}>Loading...</p>}
        {error && <p style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>{error}</p>}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            
            <div>
              <h2 style={{ marginBottom: "15px", color: "#333" }}>My Open Requests</h2>
              {myOpenRequests.length === 0 && <p style={{ color: "#666", fontStyle: "italic" }}>No open requests.</p>}
              <div style={{ display: "flex", gap: "15px", overflowX: "auto", padding: "15px 0" }}>
                {myOpenRequests.map((req) => (
                  <div key={req._id} style={{ minWidth: "260px", flex: "0 0 auto", border: "1px solid #ddd", borderRadius: "10px", padding: "15px", background: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                    <strong style={{ fontSize: "16px", color: "#2196f3" }}>{req.title}</strong>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>Posted: {new Date(req.createdAt).toLocaleString()}</div>
                    <p style={{ fontSize: "14px", marginTop: "10px", color: "#555" }}>{req.description}</p>
                    {req.completedBy ? (
                      <button onClick={() => handleSolved(req._id)} style={{ marginTop: "10px", padding: "8px 16px", background: "#4caf50", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>Mark as Solved</button>
                    ) : (
                      <p style={{ fontSize: "12px", color: "#666", marginTop: "10px", fontStyle: "italic" }}>No helper yet.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ marginBottom: "15px", color: "#333" }}>Requests I Solved</h2>
              {mySolvedForOthers.length === 0 && <p style={{ color: "#666", fontStyle: "italic" }}>No completed requests.</p>}
              <div style={{ display: "flex", gap: "15px", overflowX: "auto", padding: "15px 0" }}>
                {mySolvedForOthers.map((req) => (
                  <div key={req._id} style={{ minWidth: "260px", flex: "0 0 auto", border: "1px solid #ddd", borderRadius: "10px", padding: "15px", background: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                    <strong style={{ fontSize: "16px", color: "#ff9800" }}>{req.title}</strong>
                    <div style={{ fontSize: "13px", color: "#666", marginTop: "5px" }}>Help seeker: {req.createdBy?.name || "Unknown"}</div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "3px" }}>Completed: {new Date(req.updatedAt || req.createdAt).toLocaleString()}</div>
                    <p style={{ fontSize: "14px", marginTop: "10px", color: "#555" }}>{req.description}</p>
                    <button type="button" onClick={() => handleOpenChat(req)} style={{ marginTop: "10px", padding: "8px 16px", borderRadius: "6px", border: "none", backgroundColor: "#555", color: "white", fontSize: "13px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>View Chat</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ marginBottom: "15px", color: "#333" }}>My Completed Requests</h2>
              {myCompletedCreated.length === 0 && <p style={{ color: "#666", fontStyle: "italic" }}>No completed requests.</p>}
              <div style={{ display: "flex", gap: "15px", overflowX: "auto", padding: "15px 0" }}>
                {myCompletedCreated.map((req) => (
                  <div key={req._id} style={{ minWidth: "260px", flex: "0 0 auto", border: "1px solid #ddd", borderRadius: "10px", padding: "15px", background: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                    <strong style={{ fontSize: "16px", color: "#9c27b0" }}>{req.title}</strong>
                    <div style={{ fontSize: "13px", color: "#666", marginTop: "5px" }}>Helper: {req.completedBy?.name || "Unknown"}</div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "3px" }}>Completed: {new Date(req.updatedAt || req.createdAt).toLocaleString()}</div>
                    <p style={{ fontSize: "14px", marginTop: "10px", color: "#555" }}>{req.description}</p>
                    <button type="button" onClick={() => handleOpenChat(req)} style={{ marginTop: "10px", padding: "8px 16px", borderRadius: "6px", border: "none", backgroundColor: "#555", color: "white", fontSize: "13px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>View Chat</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {isChatOpen && activeChat && (
        <ChatWindow
          chatId={activeChat.chatId}
          currentUser={user}
          otherUser={activeChat.otherUser}
          requestTitle={activeChat.requestTitle}
          isReadOnly={activeChat.isReadOnly}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      <Graph />
      <Footer />
    </div>
  );
}

export default Myaccount;