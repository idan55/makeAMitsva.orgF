// src/Api.js
const API_URL = "http://localhost:4000/api";

// ---------- USER API ----------

export async function registerUser({ name, age, email, password, phone }) {
  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      age: Number(age),
      email,
      password,
      phone,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data; // { message, user }
}

export async function LoginUser({ email, password }) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data; // { message, token, user }
}

export async function getMe(token) {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load user");
  return data.user; // sanitized user
}

// ---------- REQUESTS API ----------

// Create a new request (needs token)
export async function createRequest({
  title,
  description,
  latitude,
  longitude,
  token,
}) {
  const res = await fetch(`${API_URL}/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description, latitude, longitude }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create request");
  return data; // { message, request }
}

// Get nearby requests (PUBLIC)
export async function getNearbyRequests({ latitude, longitude, distanceKm }) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    distanceInMeters: String(distanceKm * 1000),
  });

  const res = await fetch(`${API_URL}/requests/nearby?${params.toString()}`);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch nearby requests");
  return data; // { message, requests }
}

// "I want to help" (helper claims the request)
export async function wantToHelpRequest(id, token) {
  const res = await fetch(`${API_URL}/requests/${id}/help`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to mark as helper");
  return data; // { message, request }
}

// "Completed" (creator confirms completion)
export async function completeRequest(id, token) {
  const res = await fetch(`${API_URL}/requests/${id}/complete`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to mark completed");
  return data; // { message, request }
}

// My open requests (created by me, not completed)
export async function getMyOpenRequests(token) {
  const res = await fetch(`${API_URL}/requests/my-open`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || "Failed to fetch my open requests");
  return data; // { message, requests }
}

// Requests I solved for others (completedBy = me, isCompleted = true)
export async function getRequestsISolved(token) {
  const res = await fetch(`${API_URL}/requests/i-solved`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch solved requests");
  return data; // { message, requests }
}

// ---------- CHAT API ----------

// Start or get a chat with another user
export async function startChat({ otherUserId, token }) {
  const res = await fetch(`${API_URL}/chats/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ otherUserId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to start chat");
  }

  // data should be: { chatId, chat }
  return data;
}

// Requests I created that are completed
export async function getMyCompletedRequests(token) {
  const res = await fetch(`${API_URL}/requests/my-completed`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || "Failed to fetch my completed requests");
  return data; // { message, requests }
}
