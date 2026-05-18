"use client"
import { useEffect, useRef, useState } from "react"
import { X, Send, Minus } from "lucide-react"

type Mensaje = {
  rol: "usuario" | "agente"
  texto: string
}

// Renderiza markdown simple: **bold**, numeración, saltos de línea
function renderMarkdown(texto: string) {
  const lineas = texto.split("\n")
  const elementos: React.ReactNode[] = []

  lineas.forEach((linea, i) => {
    const trimmed = linea.trim()
    if (!trimmed) {
      elementos.push(<div key={i} style={{ height: "6px" }} />)
      return
    }

    // Línea numerada tipo "1. **Título:** xxx"
    const esNumero = /^\d+\./.test(trimmed)
    if (esNumero) {
      elementos.push(
        <div key={i} style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "10px 12px",
          marginBottom: "6px",
        }}>
          {renderLinea(trimmed)}
        </div>
      )
      return
    }

    // Sub-línea con indentación (ej: "   - **Autor:** ...")
    const esSublinea = linea.startsWith("  ") || linea.startsWith("\t") || trimmed.startsWith("-")
    if (esSublinea) {
      elementos.push(
        <div key={i} style={{
          paddingLeft: "8px",
          borderLeft: "2px solid #e2e8f0",
          marginBottom: "3px",
          fontSize: "12px",
          color: "#4b5563",
        }}>
          {renderLinea(trimmed.replace(/^-\s*/, ""))}
        </div>
      )
      return
    }

    // Línea normal
    elementos.push(
      <p key={i} style={{ margin: "0 0 4px", lineHeight: "1.6" }}>
        {renderLinea(trimmed)}
      </p>
    )
  })

  return <>{elementos}</>
}

// Convierte **texto** en <strong>
function renderLinea(linea: string): React.ReactNode[] {
  const partes = linea.split(/(\*\*[^*]+\*\*)/)
  return partes.map((parte, i) => {
    if (parte.startsWith("**") && parte.endsWith("**")) {
      return <strong key={i} style={{ fontWeight: 600, color: "#1e3a5f" }}>{parte.slice(2, -2)}</strong>
    }
    return <span key={i}>{parte}</span>
  })
}

export default function N8nPopout({ onClose, visible }: { onClose: () => void, visible: boolean }) {
  const [texto, setTexto] = useState("")
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes, loading])

  useEffect(() => {
    if (visible) inputRef.current?.focus()
  }, [visible])

  const handleEnviar = async () => {
    const pregunta = texto.trim()
    if (!pregunta || loading) return

    setTexto("")
    setError("")
    setMensajes(prev => [...prev, { rol: "usuario", texto: pregunta }])
    setLoading(true)

    try {
      const res = await fetch("https://agente-n8n-biblioteca.onrender.com/webhook/lumina-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: pregunta,
          idusu: localStorage.getItem("userId")
        })
      })
      const data = await res.json()
      const respuesta = data?.respuesta ?? JSON.stringify(data)
      setMensajes(prev => [...prev, { rol: "agente", texto: respuesta }])
    } catch {
      setError("Error al conectar con el webhook.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed bottom-20 right-6 z-50"
      style={{ display: visible ? "block" : "none" }}
    >
      <div
        className="flex flex-col overflow-hidden"
        style={{
          width: "380px",
          height: "540px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid #f0f0f0",
            background: "#ffffff",
          }}
        >
          <div className="flex items-center gap-2">
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "#2d5a9b", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontSize: "13px" }}>🤖</span>
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>Agente Lumina</p>
              <p style={{ fontSize: "11px", color: "#22c55e", margin: 0 }}>● En línea</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onClose} style={{
              color: "#9ca3af", background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center",
              padding: "4px", borderRadius: "6px",
            }} title="Minimizar">
              <Minus className="h-4 w-4" />
            </button>
            <button onClick={onClose} style={{
              color: "#9ca3af", background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center",
              padding: "4px", borderRadius: "6px",
            }} title="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div
          className="flex-1 overflow-y-auto flex flex-col gap-3"
          style={{ padding: "16px", background: "#eef2f8" }}
        >
          {mensajes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "22px" }}>📚</span>
              </div>
              <p style={{ fontSize: "13px", color: "#6b7280", maxWidth: "200px", lineHeight: "1.5" }}>
                Hola, soy tu asistente de biblioteca. ¿En qué te puedo ayudar?
              </p>
            </div>
          )}

          {mensajes.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: m.rol === "usuario" ? "flex-end" : "flex-start",
            }}>
              {m.rol === "usuario" ? (
                <div style={{
                  maxWidth: "78%",
                  padding: "10px 14px",
                  borderRadius: "18px 18px 4px 18px",
                  fontSize: "13px",
                  lineHeight: "1.55",
                  background: "#2d5a9b",
                  color: "#ffffff",
                  wordBreak: "break-word",
                }}>
                  {m.texto}
                </div>
              ) : (
                <div style={{
                  maxWidth: "92%",
                  padding: "12px 14px",
                  borderRadius: "18px 18px 18px 4px",
                  fontSize: "13px",
                  background: "#ffffff",
                  color: "#1f2937",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  wordBreak: "break-word",
                }}>
                  {renderMarkdown(m.texto)}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                background: "#ffffff", borderRadius: "18px 18px 18px 4px",
                padding: "12px 16px", display: "flex", alignItems: "center", gap: "5px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}>
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="animate-bounce" style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "#9ca3af", display: "inline-block",
                    animationDelay: `${delay}ms`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {error && (
            <p style={{ fontSize: "12px", color: "#ef4444", textAlign: "center" }}>{error}</p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 flex-shrink-0" style={{
          padding: "12px 14px", background: "#ffffff", borderTop: "1px solid #f0f0f0",
        }}>
          <input
            ref={inputRef}
            type="text"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleEnviar()}
            placeholder="Escribe tu consulta..."
            style={{
              flex: 1, padding: "9px 16px", borderRadius: "999px",
              border: "1px solid #e5e7eb", fontSize: "13px",
              color: "#374151", background: "#f9fafb", outline: "none",
            }}
          />
          <button
            onClick={handleEnviar}
            disabled={loading || !texto.trim()}
            style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: loading || !texto.trim() ? "#e5e7eb" : "#2d5a9b",
              border: "none",
              cursor: loading || !texto.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.2s",
            }}
          >
            <Send style={{
              width: "15px", height: "15px",
              color: loading || !texto.trim() ? "#9ca3af" : "#ffffff",
            }} />
          </button>
        </div>
      </div>
    </div>
  )
}

