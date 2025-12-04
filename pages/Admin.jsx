import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../src/Authcontext";
import {
  adminGetUsers,
  adminBanUser,
  adminUnbanUser,
  adminDeleteUser,
  adminGetRequests,
  adminDeleteRequest,
} from "../src/Api";

function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function load() {
      if (!isAdmin || !token) return;
      setLoading(true);
      setError("");
      try {
        const [usersData, requestsData] = await Promise.all([
          adminGetUsers(token),
          adminGetRequests(token),
        ]);
        setUsers(usersData);
        setRequests(requestsData);
      } catch (err) {
        console.error("Admin load error:", err);
        setError(err.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAdmin, token]);

  if (!isAdmin) {
    return (
      <div className="page-container">
        <Header />
        <div className="content" style={{ padding: "20px" }}>
          You need admin role to view this page.
        </div>
        <Footer />
      </div>
    );
  }

  async function handleBan(id) {
    try {
      const updated = await adminBanUser(id, token);
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
    } catch (err) {
      alert(err.message || "Failed to ban user");
    }
  }

  async function handleUnban(id) {
    try {
      const updated = await adminUnbanUser(id, token);
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
    } catch (err) {
      alert(err.message || "Failed to unban user");
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await adminDeleteUser(id, token);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  }

  async function handleDeleteRequest(id) {
    if (!window.confirm("Delete this request?")) return;
    try {
      await adminDeleteRequest(id, token);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete request");
    }
  }

  return (
    <div className="page-container">
      <Header />
      <div className="content" style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>
        <h1>Admin</h1>
        {error && <div style={{ color: "red", marginBottom: "12px" }}>{error}</div>}
        {loading && <div>Loading…</div>}

        <section style={{ marginBottom: "24px" }}>
          <h2>Users</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {users.map((u) => (
              <div key={u._id} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div><strong>{u.name}</strong> ({u.email})</div>
                  <div style={{ fontSize: "12px", color: "#555" }}>
                    Role: {u.role} · {u.isBanned ? "BANNED" : "Active"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {!u.isBanned ? (
                    <button onClick={() => handleBan(u._id)} style={{ background: "#e53935", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px" }}>
                      Ban
                    </button>
                  ) : (
                    <button onClick={() => handleUnban(u._id)} style={{ background: "#4caf50", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px" }}>
                      Unban
                    </button>
                  )}
                  <button onClick={() => handleDeleteUser(u._id)} style={{ background: "#757575", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Requests</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {requests.map((r) => (
              <div key={r._id} style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div><strong>{r.title}</strong></div>
                  <div style={{ fontSize: "12px", color: "#555" }}>
                    Creator: {r.createdBy?.name || "Unknown"} · Completed: {r.isCompleted ? "Yes" : "No"}
                  </div>
                </div>
                <button onClick={() => handleDeleteRequest(r._id)} style={{ background: "#e53935", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px" }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default Admin;
