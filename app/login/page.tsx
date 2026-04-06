"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState("/");
  const router = useRouter();

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    setNextPath(qs.get("next") || "/");
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);
        router.push(nextPath);
      }
    } catch (err) {
      setError("Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container" style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0a",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "#121212",
        border: "1px solid var(--border)",
        padding: "40px",
        borderRadius: "4px"
      }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "48px",
          letterSpacing: "2px",
          color: "var(--accent)",
          textAlign: "center",
          marginBottom: "32px"
        }}>
          COACH <span style={{ color: "var(--text)" }}>LOGIN</span>
        </h1>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{
              display: "block",
              fontFamily: "'DM Mono', monospace",
              fontSize: "14px",
              color: "var(--muted)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                background: "#1a1a1a",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "'DM Mono', monospace"
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontFamily: "'DM Mono', monospace",
              fontSize: "14px",
              color: "var(--muted)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                background: "#1a1a1a",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "'DM Mono', monospace"
              }}
            />
          </div>

          {error && (
            <div style={{ color: "var(--run)", fontSize: "14px", fontFamily: "'DM Mono', monospace" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--accent)",
              color: "#000",
              border: "none",
              padding: "14px",
              borderRadius: "2px",
              fontFamily: "'DM Mono', monospace",
              fontSize: "16px",
              fontWeight: "600",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
              marginTop: "12px",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button
            onClick={() => router.push("/onboarding")}
            style={{
              background: "transparent",
              color: "var(--muted)",
              border: "none",
              fontFamily: "'DM Mono', monospace",
              fontSize: "14px",
              textDecoration: "underline",
              cursor: "pointer",
              letterSpacing: "1px"
            }}
          >
            New User? Onboard Profile →
          </button>
        </div>
      </div>
    </div>
  );
}
