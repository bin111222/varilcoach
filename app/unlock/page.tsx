"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnlockPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    setNextPath(qs.get("next") || "/");
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Incorrect password");
      } else {
        router.replace(nextPath);
        router.refresh();
      }
    } catch {
      setError("Could not verify password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "min(440px, 92vw)",
          border: "1px solid var(--border2)",
          background: "var(--surface)",
          padding: "28px",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "44px",
            letterSpacing: "2px",
            lineHeight: 1,
            marginBottom: "8px",
          }}
        >
          PRIVATE <span style={{ color: "var(--accent)" }}>ACCESS</span>
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "13px",
            color: "var(--muted)",
            letterSpacing: "1px",
            marginBottom: "18px",
          }}
        >
          Enter password to unlock the coaching dashboard
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{ width: "100%" }}
        />
        {error && (
          <div
            style={{
              marginTop: "10px",
              fontFamily: "'DM Mono', monospace",
              color: "var(--accent3)",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !password.trim()}
          style={{
            marginTop: "16px",
            width: "100%",
            background: "var(--accent)",
            color: "#000",
            border: "none",
            borderRadius: "2px",
            padding: "12px 14px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "12px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Unlocking..." : "Unlock"}
        </button>
      </form>
    </div>
  );
}

