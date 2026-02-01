import React, { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "../state/auth.jsx";
import Field from "../ui/Field.jsx";
import Alert from "../ui/Alert.jsx";

export default function QueuePage() {
  const { user } = useAuth();
  const role = user?.role;

  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [priority, setPriority] = useState(0);

  const [tickets, setTickets] = useState([]);
  const [lastIssued, setLastIssued] = useState(null);
  const [lastCalled, setLastCalled] = useState(null);

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const canIssue = role === "student";
  const canCallNext = role === "staff" || role === "admin";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/api/services");
        if (!cancelled) {
          setServices(data);
          setServiceId(data?.[0]?._id || "");
        }
      } catch (e) {
        if (!cancelled) setErr(e?.response?.data?.message || "Failed to load services");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function refreshQueue(sid = serviceId) {
    if (!sid) return;
    const { data } = await api.get("/api/queue", { params: { serviceId: sid } });
    setTickets(data);
  }

  useEffect(() => {
    refreshQueue().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const serviceName = useMemo(() => services.find(s => s._id === serviceId)?.name || "", [services, serviceId]);

  return (
    <div className="card">
      <h1>Queue</h1>
      <small className="muted">Queue is per service. Tickets are sorted by priority then createdAt (backend logic).</small>

      <Alert type="error">{err}</Alert>

      <div className="row" style={{ alignItems: "flex-end" }}>
        <div>
          <Field label="Service">
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </Field>
        </div>

        {canIssue ? (
          <>
            <div>
              <Field label="Priority (0-5)">
                <input className="input" type="number" min="0" max="5" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
              </Field>
            </div>
            <button
              className="btn primary"
              disabled={busy || !serviceId}
              type="button"
              style={{ flex: "unset" }}
              onClick={async () => {
                setBusy(true); setErr("");
                try {
                  const { data } = await api.post("/api/queue/issue", { serviceId, priority });
                  setLastIssued(data);
                  await refreshQueue(serviceId);
                } catch (e) {
                  setErr(e?.response?.data?.message || "Failed to issue ticket");
                } finally { setBusy(false); }
              }}
            >
              Issue ticket
            </button>
          </>
        ) : null}

        {canCallNext ? (
          <button
            className="btn"
            disabled={busy || !serviceId}
            type="button"
            style={{ flex: "unset" }}
            onClick={async () => {
              setBusy(true); setErr("");
              try {
                const { data } = await api.post("/api/queue/call-next", { serviceId });
                setLastCalled(data);
                await refreshQueue(serviceId);
              } catch (e) {
                setErr(e?.response?.data?.message || "Failed to call next");
              } finally { setBusy(false); }
            }}
          >
            Call next
          </button>
        ) : null}

        <button className="btn" type="button" style={{ flex: "unset" }} onClick={() => refreshQueue(serviceId)}>Refresh</button>
      </div>

      {(lastIssued || lastCalled) ? (
        <div className="row" style={{ marginTop: 12 }}>
          {lastIssued ? <div className="success">Issued: <b>{serviceName}</b> ticket #{lastIssued.ticketNumber}</div> : null}
          {lastCalled ? <div className="success">Called: <b>{serviceName}</b> ticket #{lastCalled.ticketNumber}</div> : null}
        </div>
      ) : null}

      <h3 style={{ marginTop: 18 }}>Waiting tickets ({serviceName})</h3>
      {tickets.length === 0 ? (
        <small className="muted">No waiting tickets.</small>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Student ID</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t._id}>
                <td><b>{t.ticketNumber}</b></td>
                <td>{t.priority}</td>
                <td><span className="badge">{t.status}</span></td>
                <td><code>{t.studentId}</code></td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
