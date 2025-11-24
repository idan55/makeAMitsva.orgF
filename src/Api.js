const API_URL = "http://localhost:4000/api";

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erreur lors de l'inscription");
  }
  
  return res.json();
}