"use client";

import { useEffect, useState } from "react";

export default function SandboxSignIn() {
  const [authenticated, setAuthenticated] = useState(false);
  const [message, setMessage] = useState("Checking local session…");

  useEffect(() => {
    fetch("/api/membership/session").then((response) => response.json()).then((data) => {
      setAuthenticated(data.authenticated);
      setMessage(data.authenticated ? "Local preview session is active." : "No local preview session is active.");
    });
  }, []);

  async function toggle() {
    const response = await fetch("/api/membership/session", { method: authenticated ? "DELETE" : "POST" });
    const data = await response.json();
    setAuthenticated(data.authenticated);
    setMessage(data.authenticated ? "Local preview session started. You can now preview a membership." : "Local preview session ended.");
  }

  return (
    <div className="panel max-w-xl p-5">
      <span className="eyebrow">Local sandbox</span>
      <p className="my-4 text-sm text-muted-foreground" aria-live="polite">{message}</p>
      <button className="button" type="button" onClick={toggle}>{authenticated ? "End preview session" : "Start preview session"}</button>
    </div>
  );
}
