import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { clearAuth, loadAuth, saveAuth } from "./authStorage";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(loadAuth()?.token || null);
  const [user, setUser] = useState(loadAuth()?.user || null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    let cancelled = false;
    async function fetchMe() {
      if (!token) return;
      try {
        const { data } = await api.get("/api/auth/me");
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) {
          clearAuth();
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMe();
    return () => { cancelled = true; };
  }, [token]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthed: !!token,
    login: ({ token, user }) => {
      saveAuth({ token, user });
      setToken(token);
      setUser(user);
    },
    logout: () => {
      clearAuth();
      setToken(null);
      setUser(null);
    },
    refreshMe: async () => {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    }
  }), [token, user, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
