import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import QueuePage from "./pages/QueuePage.jsx";
import AppointmentsPage from "./pages/AppointmentsPage.jsx";
import AppointmentDetailsPage from "./pages/AppointmentDetailsPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";

export default function App() {
  return (
    <>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>

          <Route path="*" element={<div className="card"><h2>404</h2><p>Page not found.</p></div>} />
        </Routes>
      </div>
    </>
  );
}
