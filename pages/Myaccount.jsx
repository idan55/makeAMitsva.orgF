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

  // Chat state (for viewing old chats)
  const [activeChat, setActiveChat] = useState(null); // { chatId, otherUser, requestTitle, isReadOnly }
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

      // remove from open requests list
      setMyOpenRequests((prev) => prev.filter((r) => r._id !== requestId));

      // refresh user (for stars/coupon)
      const updatedUser = await getMe(token);
      login({ user: updatedUser, token });
    } catch (err) {
      console.error("handleSolved error:", err);
      setError(err.message || "Failed to mark as solved");
    }
  }

  // Open a read-only chat related to a completed request
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

      // If I'm the creator, other is helper
      if (currentUserId === creatorId && helperId) {
        otherUserId = helperId;
        otherUserObj = request.completedBy || null;
      }
      // If I'm the helper, other is creator
      else if (helperId && currentUserId === helperId) {
        otherUserId = creatorId;
        otherUserObj = request.createdBy;
      } else {
        // Fallback: just talk to creator
        otherUserId = creatorId;
        otherUserObj = request.createdBy;
      }

      if (!otherUserId) {
        setError("No other user available in this chat.");
        return;
      }

      if (otherUserId === currentUserId) {
        console.error("Resolved otherUserId to currentUser", {
          currentUserId,
          creatorId,
          helperId,
        });
        setError("Cannot open chat with yourself.");
        return;
      }

      const data = await startChat({ otherUserId, token });

      setActiveChat({
        chatId: data.chatId,
        otherUser: otherUserObj,
        requestTitle: request.title,
        isReadOnly: true, // 🔒 My account chats are read-only
      });
      setIsChatOpen(true);
    } catch (err) {
      console.error("Error opening chat from Myaccount:", err);
      setError(err.message || "Failed to open chat");
    }
  };

  const stars = user?.stars ?? 0;
  
  const starsPercent = Math.min((stars / 500) * 100, 100);

  return (
    <div className="page-container">
      <Header />
      <div className="content" style={{ padding: "20px" }}>
        <h1>My Account</h1>

        {user && (
          <div style={{ marginBottom: "20px" }}>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>

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
                />
              </div>

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
              flexDirection: "column",
              gap: "40px",
              marginTop: "20px",
            }}
          >
            {/* 1. MY OPEN REQUESTS */}
            <div>
              <h2>My open requests</h2>
              {myOpenRequests.length === 0 && <p>You have no open requests.</p>}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  padding: "10px 0",
                  scrollSnapType: "x mandatory",
                }}
              >
                {myOpenRequests.map((req) => (
                  <div
                    key={req._id}
                    style={{
                      minWidth: "220px",
                      flex: "0 0 auto",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "10px",
                      scrollSnapAlign: "start",
                    }}
                  >
                    <strong>{req.title}</strong>
                    <div>
                      Posted: {new Date(req.createdAt).toLocaleString()}
                    </div>
                    <p>{req.description}</p>

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
            </div>

            {/* 2. REQUESTS I SOLVED FOR OTHERS */}
            <div>
              <h2>Requests I solved for others</h2>
              {mySolvedForOthers.length === 0 && (
                <p>You have not completed any requests yet.</p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  padding: "10px 0",
                  scrollSnapType: "x mandatory",
                }}
              >
                {mySolvedForOthers.map((req) => (
                  <div
                    key={req._id}
                    style={{
                      minWidth: "220px",
                      flex: "0 0 auto",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "10px",
                      scrollSnapAlign: "start",
                    }}
                  >
                    <strong>{req.title}</strong>
                    <div>
                      Help seeker:{" "}
                      {req.createdBy?.name || req.createdBy?.email || "Unknown"}
                    </div>
                    <div>
                      Completed at:{" "}
                      {new Date(
                        req.updatedAt || req.createdAt
                      ).toLocaleString()}
                    </div>
                    <p>{req.description}</p>

                    {/* View chat (read-only) */}
                    <button
                      type="button"
                      onClick={() => handleOpenChat(req)}
                      style={{
                        marginTop: "8px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#555",
                        color: "white",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      View chat
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. REQUESTS I CREATED THAT ARE COMPLETED */}
            <div>
              <h2>Requests I created that are completed</h2>
              {myCompletedCreated.length === 0 && (
                <p>You have no completed requests that you created.</p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  padding: "10px 0",
                  scrollSnapType: "x mandatory",
                }}
              >
                {myCompletedCreated.map((req) => (
                  <div
                    key={req._id}
                    style={{
                      minWidth: "220px",
                      flex: "0 0 auto",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "10px",
                      scrollSnapAlign: "start",
                    }}
                  >
                    <strong>{req.title}</strong>
                    <div>
                      Helper:{" "}
                      {req.completedBy?.name ||
                        req.completedBy?.email ||
                        "Unknown"}
                    </div>
                    <div>
                      Completed at:{" "}
                      {new Date(
                        req.updatedAt || req.createdAt
                      ).toLocaleString()}
                    </div>
                    <p>{req.description}</p>

                    {/* View chat (read-only) */}
                    <button
                      type="button"
                      onClick={() => handleOpenChat(req)}
                      style={{
                        marginTop: "8px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#555",
                        color: "white",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      View chat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Read-only chat popup for completed mitzvot */}
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
