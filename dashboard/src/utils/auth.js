// src/utils/auth.js
import { BASE_URL } from "../api.js";

export function logout() {
  localStorage.removeItem("isAdmin");   // FIXED: remove admin flag
  window.location.href = "/login";
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Invalid admin username or password");

  const data = await res.json();

  // Store admin session
  localStorage.setItem("isAdmin", "true");

  return data;
}
