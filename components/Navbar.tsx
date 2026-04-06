"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, [path]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/tracker", label: "Tracker" },
    { href: "/calendar", label: "Calendar" },
    { href: "/program", label: "Programme" },
    { href: "/progress", label: "Progress" },
    { href: "/results", label: "Results" },
    { href: "/admin", label: "Admin" },
  ];

  if (path === "/login" || path === "/onboarding") return null;

  return (
    <>
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "56px",
        background: "rgba(10,10,10,0.95)",
        borderBottom: "1px solid #222",
        display: "flex",
        alignItems: "center",
        padding: "0 48px",
        zIndex: 900,
        backdropFilter: "blur(8px)",
        gap: "32px",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "16px" }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "22px",
            letterSpacing: "2px",
            color: "var(--text)",
          }}>COACH</span>
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--accent)",
            display: "inline-block",
          }} />
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: "4px", flex: 1, alignItems: "center" }} className="desktop-nav">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: active ? "var(--accent)" : "var(--muted)",
                  padding: "6px 12px",
                  borderRadius: "2px",
                  background: active ? "rgba(200,245,66,0.06)" : "transparent",
                  transition: "all 0.15s",
                  border: active ? "1px solid rgba(200,245,66,0.2)" : "1px solid transparent",
                }}
              >
                {l.label}
              </Link>
            );
          })}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--accent)",
              borderLeft: "1px solid #333",
              paddingLeft: "16px"
            }}>
              {username}
            </span>
            <button
              onClick={handleLogout}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "2px",
                transition: "all 0.15s",
                border: "1px solid #333",
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.borderColor = "var(--run)"}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.borderColor = "#333"}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--text)",
            fontSize: "20px",
            marginLeft: "auto",
          }}
          className="mobile-toggle"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed",
          top: "56px",
          left: 0,
          right: 0,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          zIndex: 899,
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: path === l.href ? "var(--accent)" : "var(--text2)",
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: "auto", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--accent)", letterSpacing: "2px" }}>{username}</span>
            <button
              onClick={handleLogout}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "12px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--run)",
                background: "none",
                border: "1px solid var(--run)",
                padding: "8px 16px",
                borderRadius: "2px"
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          nav { padding: 0 24px !important; }
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </>
  );
}
