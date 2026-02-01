import React from "react";

export default function Alert({ type = "error", children }) {
  if (!children) return null;

  const variant =
    type === "success" ? "success" :
    type === "info" ? "info" :
    "error";

  return (
    <div className={`alert ${variant}`} style={{ margin: "12px 0" }}>
      {children}
    </div>
  );
}
