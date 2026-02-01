import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../state/auth.jsx";
import Alert from "../ui/Alert.jsx";

export default function DashboardPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr("");
      try {
        const { data } = await api.get("/api/services");
        if (!cancelled) setServices(data);
      } catch (e) {
        if (!cancelled) setErr(e?.response?.data?.message || "Failed to load services");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="card">
      <h1>Dashboard</h1>
      <p>
        Welcome, <b>{user?.name}</b> (<span className="badge">{user?.role}</span>)
      </p>

      <Alert type="error">{err}</Alert>

      <h3>Available Services</h3>
      {services.length === 0 ? (
        <small className="muted">No services yet. If you are admin, open “Services” and create one.</small>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.description || "-"}</td>
                <td>{String(s.active ?? true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 12 }}>
        <small className="muted">
          Tip: create appointments to generate analytics. Queue uses a per-service counter for ticket numbers.
        </small>
      </div>
    </div>
  );
}
