"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "How did I progress this week?",
  "Should I train today?",
  "Tips for my pull day",
  "Swim technique advice",
  "Adjust my MMA recovery",
  "What should I focus on next week?",
];

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const KEY = "aiCoachSessionId";
    const existing = localStorage.getItem(KEY);
    if (existing) {
      setSessionId(existing);
      return;
    }
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(KEY, id);
    setSessionId(id);
  }, []);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    // scrollIntoView on inner content scrolls the window on first paint; only
    // scroll the chat panel, and only once there is an active thread.
    if (messages.length === 0 && !loading) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const content = text ?? input.trim();
    if (!content || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, sessionId }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      }
    } catch (e) {
      setError("Failed to reach AI coach. Check your OPENAI_API_KEY.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: "600px",
      position: "sticky",
      top: "56px",
    }}>
      {/* Header */}
      <div style={{
        padding: "24px 28px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "rgba(200,245,66,0.1)",
          border: "1px solid rgba(200,245,66,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
        }}>
          ⚡
        </div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "2px", color: "var(--accent)" }}>
            AI COACH
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)" }}>
            Claude Opus · Knows your programme
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesScrollRef}
        style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        minHeight: 0,
      }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "40px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", color: "#222", letterSpacing: "3px", marginBottom: "12px" }}>
              READY
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "var(--muted)", letterSpacing: "2px", marginBottom: "24px" }}>
              Ask about your programme, recovery, form, or adjustments.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p)}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border2)",
                    borderRadius: "2px",
                    padding: "10px 16px",
                    textAlign: "left",
                    color: "var(--text2)",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLButtonElement).style.borderColor = "var(--accent)";
                    (e.target as HTMLButtonElement).style.color = "var(--text)";
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLButtonElement).style.borderColor = "var(--border2)";
                    (e.target as HTMLButtonElement).style.color = "var(--text2)";
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              animation: "fadeInUp 0.2s ease",
            }}
          >
            <div style={{
              maxWidth: "90%",
              padding: "12px 16px",
              borderRadius: "2px",
              fontSize: "14px",
              lineHeight: "1.7",
              background: msg.role === "user"
                ? "rgba(200,245,66,0.08)"
                : "var(--surface)",
              border: msg.role === "user"
                ? "1px solid rgba(200,245,66,0.2)"
                : "1px solid var(--border)",
              color: msg.role === "user" ? "var(--text)" : "var(--text2)",
              whiteSpace: "pre-wrap",
            }}>
              {msg.role === "assistant" ? (
                <div style={{ whiteSpace: "normal" }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      strong: ({ children }) => (
                        <strong style={{ color: "var(--accent)", fontWeight: 700 }}>
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em style={{ fontStyle: "italic", color: "var(--text)" }}>
                          {children}
                        </em>
                      ),
                      p: ({ children }) => (
                        <p style={{ margin: "0 0 10px", lineHeight: "1.75" }}>
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul style={{ margin: "0 0 10px", paddingLeft: "18px" }}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol style={{ margin: "0 0 10px", paddingLeft: "18px" }}>
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li style={{ margin: "4px 0" }}>{children}</li>
                      ),
                      code: ({ children }) => (
                        <code
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "14px",
                            background: "rgba(200,245,66,0.08)",
                            border: "1px solid rgba(200,245,66,0.18)",
                            padding: "1px 6px",
                            borderRadius: "2px",
                            color: "var(--text)",
                          }}
                        >
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "15px",
              color: "var(--muted)",
              letterSpacing: "1px",
              marginTop: "4px",
            }}>
              {msg.role === "user" ? "You" : "Coach"}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "12px 16px",
              borderRadius: "2px",
              display: "flex",
              gap: "4px",
              alignItems: "center",
            }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    animation: "pulse 1.2s infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: "#1a0505",
            border: "1px solid var(--mma)",
            padding: "12px 16px",
            borderRadius: "2px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "15px",
            color: "var(--mma)",
            letterSpacing: "1px",
          }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: "16px 24px 20px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach..."
            rows={2}
            disabled={loading}
            style={{
              flex: 1,
              resize: "none",
              padding: "10px 14px",
              fontSize: "15px",
              lineHeight: "1.5",
              opacity: loading ? 0.6 : 1,
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? "var(--accent)" : "var(--surface2)",
              color: input.trim() && !loading ? "#000" : "var(--muted)",
              border: "none",
              borderRadius: "2px",
              width: "44px",
              flexShrink: 0,
              fontSize: "16px",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            ↑
          </button>
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "15px",
          color: "var(--muted)",
          letterSpacing: "1px",
        }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
