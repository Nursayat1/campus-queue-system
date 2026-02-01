import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../state/auth.jsx";
import Field from "../ui/Field.jsx";
import Alert from "../ui/Alert.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="card" style={{ maxWidth: 520, margin: "24px auto" }}>
      <h1>Login</h1>
      <small className="muted">Use your account to access queue, appointments and analytics.</small>

      <Alert type="error">{err}</Alert>

      <form onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        setBusy(true);
        try {
          const { data } = await api.post("/api/auth/login", { email, password });
          login({ token: data.token, user: data.user });
          nav("/dashboard");
        } catch (e2) {
          setErr(e2?.response?.data?.message || "Login failed");
        } finally {
          setBusy(false);
        }
      }}>
        <Field label="Email">
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@uni.edu" />
        </Field>
        <Field label="Password">
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <button className="btn primary" disabled={busy} type="submit">{busy ? "Signing in..." : "Sign in"}</button>
      </form>

      <p style={{ marginTop: 14 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
