import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../state/auth.jsx";
import Field from "../ui/Field.jsx";
import Alert from "../ui/Alert.jsx";

export default function RegisterPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // student, staff, admin
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="card" style={{ maxWidth: 520, margin: "24px auto" }}>
      <h1>Register</h1>
      <small className="muted">For demo/defense you can register different roles.</small>

      <Alert type="error">{err}</Alert>

      <form onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        setBusy(true);
        try {
          const { data } = await api.post("/api/auth/register", { name, email, password, role });
          login({ token: data.token, user: data.user });
          nav("/dashboard");
        } catch (e2) {
          setErr(e2?.response?.data?.message || "Registration failed");
        } finally {
          setBusy(false);
        }
      }}>
        <Field label="Name">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email">
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@uni.edu" />
        </Field>
        <Field label="Password">
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Role">
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">student</option>
            <option value="staff">staff</option>
            <option value="admin">admin</option>
          </select>
        </Field>
        <button className="btn primary" disabled={busy} type="submit">{busy ? "Creating..." : "Create account"}</button>
      </form>

      <p style={{ marginTop: 14 }}>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
