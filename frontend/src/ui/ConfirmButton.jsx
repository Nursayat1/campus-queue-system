import React, { useState } from "react";

export default function ConfirmButton({ children, confirmText = "Are you sure?", onConfirm, className = "btn danger", disabled }) {
  const [asking, setAsking] = useState(false);

  return (
    <button
      className={className}
      disabled={disabled}
      onClick={async () => {
        if (!asking) return setAsking(true);
        setAsking(false);
        await onConfirm();
      }}
      onBlur={() => setAsking(false)}
      title={asking ? confirmText : undefined}
      type="button"
    >
      {asking ? "Click again" : children}
    </button>
  );
}
