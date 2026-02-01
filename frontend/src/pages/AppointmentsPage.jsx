import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../state/auth.jsx";
import Field from "../ui/Field.jsx";
import Alert from "../ui/Alert.jsx";
import ConfirmButton from "../ui/ConfirmButton.jsx";

function toLocalInputValue(date) {
  // yyyy-MM-ddTHH:mm for <input type="datetime-local">
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const role = user?.role;

  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [startTime, setStartTime] = useState(toLocalInputValue(new Date(Date.now() + 60*60*1000)));
  const [endTime, setEndTime] = useState(toLocalInputValue(new Date(Date.now() + 2*60*60*1000)));
  const [priority, setPriority] = useState(0);

  const [filterStatus, setFilterStatus] = useState("");
  const [items, setItems] = useState([]);

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const canCreate = role === "student";

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

  async function reload() {
    const params = {};
    if (serviceId) params.serviceId = serviceId;
    if (filterStatus) params.status = filterStatus;
    if (role === "student") params.studentId = user?._id || user?.id; // optional filter
    const { data } = await api.get("/api/appointments", { params });
    setItems(data);
  }

  useEffect(() => {
    reload().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, filterStatus]);

  const serviceName = useMemo(() => services.find(s => s._id === serviceId)?.name || "", [services, serviceId]);

  return (
    <div className="card">
      <h1>Appointments</h1>
      <small className="muted">
        Students create & cancel their appointments. Staff/admin can update appointment status and add notes in details page.
      </small>

      <Alert type="error">{err}</Alert>

      <div className="row" style={{ alignItems: "flex-end", marginTop: 8 }}>
        <div>
          <Field label="Service">
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </Field>
        </div>

        <div>
          <Field label="Filter status">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">(all)</option>
              <option value="booked">booked</option>
              <option value="checked_in">checked_in</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </Field>
        </div>

        <button className="btn" style={{ flex: "unset" }} type="button" onClick={reload}>Refresh</button>
      </div>

      {canCreate ? (
        <>
          <h3 style={{ marginTop: 18 }}>Create appointment (Student)</h3>
          <div className="row" style={{ alignItems: "flex-end" }}>
            <div>
              <Field label="Start time">
                <input className="input" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </Field>
            </div>
            <div>
              <Field label="End time">
                <input className="input" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </Field>
            </div>
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
                  await api.post("/api/appointments", {
                    serviceId,
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date(endTime).toISOString(),
                    priority
                  });
                  await reload();
                } catch (e) {
                  setErr(e?.response?.data?.message || "Create failed");
                } finally { setBusy(false); }
              }}
            >
              Create
            </button>
          </div>
          <small className="muted">
            Backend blocks overlaps for same service (and windowId if set), returning 409 “Time slot is already taken”.
          </small>
        </>
      ) : null}

      <h3 style={{ marginTop: 18 }}>List ({serviceName || "All services"})</h3>
      {items.length === 0 ? (
        <small className="muted">No appointments found.</small>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Student</th>
              <th style={{ width: 240 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a._id}>
                <td>
                  {new Date(a.startTime).toLocaleString()} – {new Date(a.endTime).toLocaleString()}
                </td>
                <td><span className="badge">{a.status}</span></td>
                <td>{a.priority}</td>
                <td><code>{a.studentId}</code></td>
                <td>
                  <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
                    <Link className="btn" to={`/appointments/${a._id}`}>Details</Link>

                    {role === "student" ? (
                      <ConfirmButton
                        disabled={a.status === "cancelled"}
                        onConfirm={async () => {
                          setErr("");
                          try {
                            await api.delete(`/api/appointments/${a._id}`);
                            await reload();
                          } catch (e) {
                            setErr(e?.response?.data?.message || "Cancel failed");
                          }
                        }}
                      >
                        Cancel
                      </ConfirmButton>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
