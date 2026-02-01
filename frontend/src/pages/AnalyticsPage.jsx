import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../state/auth.jsx";
import Field from "../ui/Field.jsx";
import Alert from "../ui/Alert.jsx";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const role = user?.role;

  const canView = role === "staff" || role === "admin";
  const canRebuild = role === "admin";

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [rows, setRows] = useState([]);
  const [materialized, setMaterialized] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function loadAgg() {
    const { data } = await api.get("/api/analytics/service-load", { params: { from: from || undefined, to: to || undefined } });
    setRows(data);
  }

  async function loadMaterialized() {
    const { data } = await api.get("/api/analytics/service-load/materialized");
    setMaterialized(data);
  }

  useEffect(() => {
    if (!canView) return;
    loadAgg().catch(() => {});
    loadMaterialized().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!canView) {
    return (
      <div className="card">
        <h1>Analytics</h1>
        <div className="error">Only <b>staff</b> or <b>admin</b> can access analytics.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Analytics (Aggregation)</h1>
      <small className="muted">
        This page demonstrates MongoDB aggregation and a materialized view rebuilt with $merge.
      </small>

      <Alert type="error">{err}</Alert>
      <Alert type="success">{msg}</Alert>

      <div className="row" style={{ alignItems: "flex-end", marginTop: 10 }}>
        <div>
          <Field label="From (ISO date/time)">
            <input className="input" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="2026-02-01T00:00:00.000Z" />
          </Field>
        </div>
        <div>
          <Field label="To (ISO date/time)">
            <input className="input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="2026-03-01T00:00:00.000Z" />
          </Field>
        </div>
        <button className="btn" style={{ flex: "unset" }} type="button" onClick={async () => {
          setErr(""); setMsg("");
          try { await loadAgg(); }
          catch (e) { setErr(e?.response?.data?.message || "Failed"); }
        }}>Run aggregation</button>

        {canRebuild ? (
          <button className="btn primary" style={{ flex: "unset" }} type="button" onClick={async () => {
            setErr(""); setMsg("");
            try {
              const { data } = await api.post("/api/analytics/service-load/rebuild");
              setMsg(data.message || "Rebuilt");
              await loadMaterialized();
            } catch (e) {
              setErr(e?.response?.data?.message || "Rebuild failed");
            }
          }}>Rebuild materialized</button>
        ) : null}

        <button className="btn" style={{ flex: "unset" }} type="button" onClick={loadMaterialized}>Refresh materialized</button>
      </div>

      <h3 style={{ marginTop: 18 }}>Aggregation result (live)</h3>
      {rows.length === 0 ? (
        <small className="muted">No data yet. Create appointments first.</small>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Total</th>
              <th>Avg Priority</th>
              <th>Earliest</th>
              <th>Latest</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td>{r.serviceName || r.serviceId}</td>
                <td><b>{r.totalAppointments}</b></td>
                <td>{r.avgPriority}</td>
                <td>{r.earliest ? new Date(r.earliest).toLocaleString() : "-"}</td>
                <td>{r.latest ? new Date(r.latest).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: 18 }}>Materialized collection (service_load_analytics)</h3>
      {materialized.length === 0 ? (
        <small className="muted">Empty. Admin can rebuild it.</small>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ServiceId</th>
              <th>Total</th>
              <th>Avg Priority</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {materialized.map((m) => (
              <tr key={m._id || m.serviceId}>
                <td><code>{m.serviceId}</code></td>
                <td><b>{m.totalAppointments}</b></td>
                <td>{m.avgPriority}</td>
                <td>{m.updatedAt ? new Date(m.updatedAt).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
