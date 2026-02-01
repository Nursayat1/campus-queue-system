import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "../state/auth.jsx";
import { useTheme } from "../state/theme.jsx";

function Item({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
    >
      {children}
    </NavLink>
  );
}

export default function NavBar() {
  const { isAuthed, user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  return (
    <div className="nav">
      <div className="nav-inner">
        <Link to={isAuthed ? "/dashboard" : "/login"} className="brand">
          Campus Queue
        </Link>

        <div className="row" style={{ justifyContent: "flex-end", gap: 8, flex: "unset" }}>
          {!isAuthed ? (
            <>
              <button type="button" className="btn" onClick={toggle} title="Toggle theme">
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                <span style={{ fontSize: 12 }}>{theme === "dark" ? "Light" : "Dark"}</span>
              </button>

              <Item to="/login">Login</Item>
              <Item to="/register">Register</Item>
            </>
          ) : (
            <>
              <Item to="/dashboard">Dashboard</Item>
              <Item to="/queue">Queue</Item>
              <Item to="/appointments">Appointments</Item>
              {(user?.role === "admin") ? <Item to="/services">Services</Item> : null}
              {(user?.role === "admin" || user?.role === "staff") ? <Item to="/analytics">Analytics</Item> : null}
              <Item to="/profile">Profile</Item>

              <button type="button" className="btn" onClick={toggle} title="Toggle theme">
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                <span style={{ fontSize: 12 }}>{theme === "dark" ? "Light" : "Dark"}</span>
              </button>

              <button
                className="btn danger"
                onClick={() => { logout(); nav("/login"); }}
                type="button"
                style={{ flex: "unset" }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
