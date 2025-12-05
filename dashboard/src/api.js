// src/api.js
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + endpoint, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Server error:", text);
    throw new Error("API request failed: " + res.status);
  }

  return res.json();
}
