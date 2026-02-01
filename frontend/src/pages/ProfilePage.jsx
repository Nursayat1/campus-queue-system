import React from "react";
import { useAuth } from "../state/auth.jsx";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="card" style={{ maxWidth: 680 }}>
      <h1>Profile</h1>
      <table>
        <tbody>
          <tr><th style={{ width: 180 }}>Name</th><td>{user?.name}</td></tr>
          <tr><th>Email</th><td>{user?.email}</td></tr>
          <tr><th>Role</th><td><span className="badge">{user?.role}</span></td></tr>
          <tr><th>User ID</th><td><code>{user?._id || user?.id || "—"}</code></td></tr>
        </tbody>
      </table>

      <p style={{ marginTop: 12 }}>
        <small className="muted">
          Roles: <b>student</b> issues queue tickets & creates appointments; <b>staff</b> calls next in queue and views analytics; <b>admin</b> manages services and analytics.
        </small>
      </p>
    </div>
  );
}
