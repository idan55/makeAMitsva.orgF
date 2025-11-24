const API_URL = "http://localhost:4000/api";

export async function registerUser(data) {
    const res = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    return res.json();
}
