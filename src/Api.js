const API_URL = "http://localhost:4000/api";

export async function registerUser({ name, age, email, password, phone }) {
  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      age: Number(age),
      email,
      password,
      phone
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data; 
}


export async function LoginUser({ email, password }) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}



// Create a new request (needs token)
export async function createRequest({ title, description, latitude, longitude, token }) {
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
    distanceInMeters: String(distanceKm * 1000), // km → m
  });

  const res = await fetch(`${API_URL}/requests/nearby?${params.toString()}`);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch nearby requests");
  return data; // { message, requests }
}
