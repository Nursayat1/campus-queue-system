import React from "react";

export default function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label ? <label>{label}</label> : null}
      {children}
    </div>
  );
}
