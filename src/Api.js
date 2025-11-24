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
