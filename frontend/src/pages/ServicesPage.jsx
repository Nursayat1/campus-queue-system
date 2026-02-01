import React, { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "../state/auth.jsx";
import Field from "../ui/Field.jsx";
import Alert from "../ui/Alert.jsx";
import ConfirmButton from "../ui/ConfirmButton.jsx";

export default function ServicesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [editing, setEditing] = useState(null); // null or service object
  const [form, setForm] = useState({ name: "", description: "", active: true });

  async function reload() {
    const { data } = await api.get("/api/services");
    setItems(data);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { await reload(); }
      catch (e) { if (!cancelled) setErr(e?.response?.data?.message || "Failed to load"); }
    })();
    return () => { cancelled = true; };
  }, []);

  const canEdit = useMemo(() => isAdmin, [isAdmin]);

  if (!canEdit) {
    return (
      <div className="card">
        <h1>Services</h1>
        <div className="error">Only <b>admin</b> can create/update/delete services.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Services (Admin)</h1>
      <Alert type="error">{err}</Alert>

      <div className="row" style={{ alignItems: "flex-end" }}>
        <div style={{ flex: 2 }}>
          <Field label="Name">
            <input className="input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
        </div>
        <div style={{ flex: 3 }}>
          <Field label="Description">
            <input className="input" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Active">
            <select value={String(form.active)} onChange={(e) => setForm(f => ({ ...f, active: e.target.value === "true" }))}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </Field>
        </div>

        <button
          className="btn primary"
          disabled={busy || !form.name.trim()}
          type="button"
          style={{ flex: "unset" }}
          onClick={async () => {
            setErr("");
            setBusy(true);
            try {
              if (!editing) {
                await api.post("/api/services", form);
              } else {
                await api.put(`/api/services/${editing._id}`, form);
              }
              setEditing(null);
              setForm({ name: "", description: "", active: true });
              await reload();
            } catch (e) {
              setErr(e?.response?.data?.message || "Save failed");
            } finally {
              setBusy(false);
            }
          }}
        >
          {editing ? "Update" : "Create"}
        </button>

        {editing ? (
          <button className="btn" type="button" style={{ flex: "unset" }} onClick={() => {
            setEditing(null);
            setForm({ name: "", description: "", active: true });
          }}>
            Cancel
          </button>
        ) : null}
      </div>

      <h3 style={{ marginTop: 18 }}>All services</h3>
      {items.length === 0 ? (
        <small className="muted">No services created yet.</small>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Active</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(s => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.description || "-"}</td>
                <td>{String(s.active ?? true)}</td>
                <td>
                  <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
                    <button className="btn" type="button" onClick={() => {
                      setEditing(s);
                      setForm({ name: s.name || "", description: s.description || "", active: s.active ?? true });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}>
                      Edit
                    </button>
                    <ConfirmButton onConfirm={async () => {
                      setErr("");
                      try {
                        await api.delete(`/api/services/${s._id}`);
                        await reload();
                      } catch (e) {
                        setErr(e?.response?.data?.message || "Delete failed");
                      }
                    }}>
                      Delete
                    </ConfirmButton>
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
