import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("authToken");
    if (saved) {
      setToken(saved);
      verifyToken(saved);
    } else {
      setLoading(false);
    }
  }, []);

  async function verifyToken(tok) {
    try {
      const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:5050";
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tok}` },
      }).then((r) => r.json());

      if (res.ok) {
        setUser(res.user);
        setToken(tok);
      } else {
        localStorage.removeItem("authToken");
        setToken(null);
      }
    } catch (e) {
      localStorage.removeItem("authToken");
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function signup(email, password) {
    const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:5050";
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json());

    if (res.ok) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("authToken", res.token);
      return res;
    }
    throw new Error(res.error);
  }

  async function login(email, password) {
    const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:5050";
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json());

    if (res.ok) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("authToken", res.token);
      return res;
    }
    throw new Error(res.error);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
