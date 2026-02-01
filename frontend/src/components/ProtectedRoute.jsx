import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";

export default function ProtectedRoute() {
  const { isAuthed, loading } = useAuth();
  if (loading) return <div className="card">Loading...</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <Outlet />;
}
