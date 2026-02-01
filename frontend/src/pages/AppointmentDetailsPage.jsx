import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../state/auth.jsx";
import Field from "../ui/Field.jsx";
import Alert from "../ui/Alert.jsx";
import ConfirmButton from "../ui/ConfirmButton.jsx";

export default function AppointmentDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role;

  const [doc, setDoc] = useState(null);
  const [services, setServices] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState(0);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, s] = await Promise.all([
          api.get(`/api/appointments/${id}`),
          api.get("/api/services"),
        ]);
        if (!cancelled) {
          setDoc(a.data);
          setServices(s.data);
          setStatus(a.data.status);
          setPriority(a.data.priority);
        }
      } catch (e) {
        if (!cancelled) setErr(e?.response?.data?.message || "Failed to load appointment");
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const serviceName = useMemo(() => services.find(s => s._id === doc?.serviceId)?.name || doc?.serviceId, [services, doc]);

  if (!doc) return <div className="card">Loading...</div>;

  const canUpdate = role === "staff" || role === "admin";
  const canAddNotes = canUpdate || role === "student"; // any authed user can add note per backend

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h1>Appointment</h1>
          <small className="muted">
            Service: <b>{serviceName}</b> • Student: <code>{doc.studentId}</code>
          </small>
        </div>
        <div style={{ flex: "unset" }}>
          <Link className="btn" to="/appointments">Back</Link>
        </div>
      </div>

      <Alert type="error">{err}</Alert>

      <table style={{ marginTop: 12 }}>
        <tbody>
          <tr><th style={{ width: 180 }}>Start</th><td>{new Date(doc.startTime).toLocaleString()}</td></tr>
          <tr><th>End</th><td>{new Date(doc.endTime).toLocaleString()}</td></tr>
          <tr><th>Status</th><td><span className="badge">{doc.status}</span></td></tr>
          <tr><th>Priority</th><td>{doc.priority}</td></tr>
        </tbody>
      </table>

      {canUpdate ? (
        <>
          <h3 style={{ marginTop: 18 }}>Update (Staff/Admin)</h3>
          <div className="row" style={{ alignItems: "flex-end" }}>
            <div>
              <Field label="Status">
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="booked">booked</option>
                  <option value="checked_in">checked_in</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </Field>
            </div>
            <div>
              <Field label="Priority">
                <input className="input" type="number" min="0" max="5" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
              </Field>
            </div>
            <button
              className="btn primary"
              type="button"
              disabled={busy}
              style={{ flex: "unset" }}
              onClick={async () => {
                setBusy(true); setErr("");
                try {
                  const { data } = await api.put(`/api/appointments/${id}`, { status, priority });
                  setDoc(data);
                } catch (e) {
                  setErr(e?.response?.data?.message || "Update failed");
                } finally { setBusy(false); }
              }}
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <small className="muted" style={{ display: "block", marginTop: 12 }}>
          Only staff/admin can update status/priority.
        </small>
      )}

      <h3 style={{ marginTop: 18 }}>Notes</h3>

      {canAddNotes ? (
        <div className="row" style={{ alignItems: "flex-end" }}>
          <div style={{ flex: 4 }}>
            <Field label="New note">
              <textarea className="input" rows={2} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Write a note (e.g., required documents)..." />
            </Field>
          </div>
          <button
            className="btn"
            type="button"
            style={{ flex: "unset" }}
            disabled={busy || !noteText.trim()}
            onClick={async () => {
              setBusy(true); setErr("");
              try {
                const { data } = await api.post(`/api/appointments/${id}/notes`, { text: noteText });
                setDoc(data);
                setNoteText("");
              } catch (e) {
                setErr(e?.response?.data?.message || "Add note failed");
              } finally { setBusy(false); }
            }}
          >
            Add note
          </button>
        </div>
      ) : null}

      {doc.notes?.length ? (
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>By</th>
              <th>Text</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doc.notes.map(n => (
              <NoteRow key={n._id} note={n} canEdit={canUpdate || n.byUserId === (user?._id || user?.id)} appointmentId={id} onUpdated={setDoc} onError={setErr} />
            ))}
          </tbody>
        </table>
      ) : (
        <small className="muted">No notes yet.</small>
      )}
    </div>
  );
}

function NoteRow({ note, canEdit, appointmentId, onUpdated, onError }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text || "");
  const [busy, setBusy] = useState(false);

  return (
    <tr>
      <td>{new Date(note.createdAt).toLocaleString()}</td>
      <td><code>{note.byUserId}</code></td>
      <td>
        {editing ? (
          <textarea className="input" rows={2} value={text} onChange={(e) => setText(e.target.value)} />
        ) : (
          note.text
        )}
      </td>
      <td>
        {canEdit ? (
          <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
            {editing ? (
              <>
                <button className="btn primary" disabled={busy} type="button" onClick={async () => {
                  setBusy(true); onError("");
                  try {
                    const { data } = await api.put(`/api/appointments/${appointmentId}/notes/${note._id}`, { text });
                    onUpdated(data);
                    setEditing(false);
                  } catch (e) {
                    onError(e?.response?.data?.message || "Update note failed");
                  } finally { setBusy(false); }
                }}>Save</button>
                <button className="btn" type="button" onClick={() => { setEditing(false); setText(note.text || ""); }}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn" type="button" onClick={() => setEditing(true)}>Edit</button>
                <ConfirmButton onConfirm={async () => {
                  onError("");
                  const { data } = await api.delete(`/api/appointments/${appointmentId}/notes/${note._id}`);
                  onUpdated(data);
                }}>
                  Delete
                </ConfirmButton>
              </>
            )}
          </div>
        ) : (
          <small className="muted">—</small>
        )}
      </td>
    </tr>
  );
}
