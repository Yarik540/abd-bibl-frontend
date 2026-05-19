"use client"
import N8nPopout from "@/components/N8nPopout"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen, LogOut, PlusCircle, List, Search,
  CheckCircle, AlertTriangle, Clock, MessageCircle
} from "lucide-react"

const API = "https://abd-eva-2026-production.up.railway.app"

const MOCK_REGISTROS = [
  { idreg: 1, titulolibro: "Cien años de soledad", autor: "García Márquez", tipo: "novela", contenidoreg: "Una saga familiar en Macondo.", fechareg: "2025-05-10T14:22:00" },
  { idreg: 2, titulolibro: "El principito", autor: "Saint-Exupéry", tipo: "cuento", contenidoreg: "Un aviador conoce a un pequeño príncipe.", fechareg: "2025-05-09T10:11:00" },
  { idreg: 3, titulolibro: "1984", autor: "Orwell", tipo: "distopía", contenidoreg: "Un mundo vigilado por el Gran Hermano.", fechareg: "2025-05-08T08:45:00" },
]

const MOCK_BUSQUEDA = {
  consulta: "novela latinoamericana",
  tiempo_ms: 145,
  resultados: [
    { titulolibro: "Cien años de soledad", autor: "García Márquez", tipo: "novela", similitud: 0.92 },
    { titulolibro: "El amor en los tiempos del cólera", autor: "García Márquez", tipo: "novela", similitud: 0.87 },
  ]
}

const TABS = [
  { id: "nuevo", label: "Nuevo Registro", icon: PlusCircle },
  { id: "mis-registros", label: "Mis Registros", icon: List },
  { id: "busqueda", label: "Búsqueda Semántica", icon: Search },
]

function Sidebar({
  active,
  setActive,
  usuario,
  rolVisual
}: {
  active: string,
  setActive: (t: string) => void,
  usuario: string,
  rolVisual: string
}) {
  const router = useRouter()

  const handleLogout = async () => {
    const token = localStorage.getItem("token")
    try {
      await fetch(`${API}/api/Auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch { }
    finally {
      localStorage.clear()
      router.push("/")
    }
  }

  return (
    <aside className="w-60 h-screen sticky top-0 flex flex-col" style={{
      background: "linear-gradient(180deg, #0f1623 0%, #131d2e 100%)",
      borderRight: "1px solid rgba(255,255,255,0.06)"
    }}>
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-white text-[15px] tracking-tight">Biblioteca Lumina</span>
        </div>
        <p className="text-[11px] text-slate-500 ml-10">Panel Estudiante</p>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-2" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      {/* User info */}
      <div className="px-6 py-3 mb-2">
        <p className="text-[11px] text-slate-500">Bienvenido,</p>
        <p className="text-[13px] font-medium text-slate-300 truncate">{usuario}</p>
        <p className="text-[11px] mt-0.5" style={{ color: "#60a5fa" }}>{rolVisual}</p>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-3" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => setActive(id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all w-full text-left"
              style={{
                color: isActive ? "#fff" : "rgba(148,163,184,0.8)",
                background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent"
              }}>
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: isActive ? "#60a5fa" : "rgba(148,163,184,0.6)" }} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] w-full transition-all"
          style={{ color: "rgba(248,113,113,0.85)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default function ClientePage() {
  const router = useRouter()
  const [tab, setTab] = useState("nuevo")
  const [usuario, setUsuario] = useState("")
  const [rolVisual, setRolVisual] = useState("")
  const [showN8n, setShowN8n] = useState(false)

  const [form, setForm] = useState({ titulolibro: "", autor: "", tipo: "", contenidoreg: "" })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [latencia, setLatencia] = useState<number | null>(null)

  const [registros, setRegistros] = useState<any[]>([])
  const [regLoading, setRegLoading] = useState(false)

  const [textoBusqueda, setTextoBusqueda] = useState("")
  const [busquedaLoading, setBusquedaLoading] = useState(false)
  const [busquedaResultado, setBusquedaResultado] = useState<any>(null)
  const [busquedaError, setBusquedaError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const rol = localStorage.getItem("rol")
    const usu = localStorage.getItem("usuario") || "Cliente"

    if (!token || rol !== "cliente") {
      router.push("/")
      return
    }

    setUsuario(usu)
    setRolVisual(rol === "cliente" ? "Estudiante" : rol)
  }, [])

  useEffect(() => {
    if (tab !== "mis-registros") return
    const token = localStorage.getItem("token")
    setRegLoading(true)
    fetch(`${API}/api/registros`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setRegistros)
      .catch(() => setRegistros(MOCK_REGISTROS))
      .finally(() => setRegLoading(false))
  }, [tab])

  const handleSubmit = async () => {
    setFormError(""); setFormSuccess(""); setLatencia(null)
    const token = localStorage.getItem("token")
    setFormLoading(true)
    try {
      const res = await fetch(`${API}/api/registros`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        const texto = await res.text()
        setFormError(texto || "Error al guardar el registro.")
        return
      }

      const data = await res.json()
      setFormSuccess("Registro guardado exitosamente.")
      setLatencia(data.latencia_ms)
      setForm({ titulolibro: "", autor: "", tipo: "", contenidoreg: "" })
    } catch {
      setFormError("Error al conectar con el servidor.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleBusqueda = async () => {
    setBusquedaError(""); setBusquedaResultado(null)
    if (!textoBusqueda.trim()) return setBusquedaError("Ingresa un texto para buscar.")
    const token = localStorage.getItem("token")
    setBusquedaLoading(true)
    try {
      const res = await fetch(`${API}/api/busqueda/conlog?texto=${encodeURIComponent(textoBusqueda)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      setBusquedaResultado(data)
    } catch {
      setBusquedaResultado(MOCK_BUSQUEDA)
    } finally {
      setBusquedaLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f4f6f9", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Sidebar
        active={tab}
        setActive={setTab}
        usuario={usuario}
        rolVisual={rolVisual}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between"
          style={{ background: "rgba(244,246,249,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div>
            <h1 className="text-[18px] font-bold text-slate-800 leading-tight">Mi Espacio</h1>
            <p className="text-[12px] text-slate-400">Gestiona tus registros y consultas</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-slate-500"
            style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sistema activo
          </div>
        </header>

        <div className="flex-1 px-8 py-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "#e8ecf2" }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
                style={{
                  background: tab === id ? "#fff" : "transparent",
                  color: tab === id ? "#1e40af" : "#64748b",
                  boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}>
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Nuevo Registro */}
          {tab === "nuevo" && (
            <div className="flex justify-center">
              <div className="w-full max-w-xl rounded-2xl overflow-hidden"
                style={{ background: "#fff", boxShadow: "0 4px 20px rgba(59,130,246,0.10)" }}>

                {/* Header */}
                <div className="px-6 pt-6 pb-5 flex items-center justify-between"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}
                >
                  <div>
                    <p className="text-[15px] font-bold text-white">Nuevo registro</p>
                    <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                      Completa los datos de tu apunte literario
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.18)" }}>
                    <PlusCircle className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Form body */}
                <div className="px-6 py-6 flex flex-col gap-4">

                  {/* Título */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Título</label>
                    <input type="text" value={form.titulolibro}
                      onChange={e => { setForm({ ...form, titulolibro: e.target.value }); setFormError("") }}
                      placeholder="Ej: Cien años de soledad"
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-700 transition-all"
                      style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc", outline: "none" }}
                      onFocus={e => { e.currentTarget.style.border = "1.5px solid #3b82f6"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)" }}
                      onBlur={e => { e.currentTarget.style.border = "1.5px solid #e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none" }} />
                  </div>

                  {/* Autor */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Autor</label>
                    <input type="text" value={form.autor}
                      onChange={e => { setForm({ ...form, autor: e.target.value }); setFormError("") }}
                      placeholder="Ej: Gabriel García Márquez"
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-700 transition-all"
                      style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc", outline: "none" }}
                      onFocus={e => { e.currentTarget.style.border = "1.5px solid #3b82f6"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)" }}
                      onBlur={e => { e.currentTarget.style.border = "1.5px solid #e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none" }} />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipo</label>
                    <select value={form.tipo}
                      onChange={e => { setForm({ ...form, tipo: e.target.value }); setFormError("") }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-700 transition-all"
                      style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc", outline: "none" }}
                      onFocus={e => { e.currentTarget.style.border = "1.5px solid #3b82f6"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)" }}
                      onBlur={e => { e.currentTarget.style.border = "1.5px solid #e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none" }}>
                      <option value="">Selecciona un tipo</option>
                      <option value="novela">Novela</option>
                      <option value="cuento">Cuento</option>
                      <option value="poesía">Poesía</option>
                      <option value="ensayo">Ensayo</option>
                      <option value="distopía">Distopía</option>
                      <option value="épica">Épica</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  {/* Contenido */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contenido / Descripción</label>
                    <textarea value={form.contenidoreg}
                      onChange={e => setForm({ ...form, contenidoreg: e.target.value })}
                      placeholder="Breve descripción de tus apuntes..."
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-700 resize-none transition-all"
                      style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc", outline: "none" }}
                      onFocus={e => { e.currentTarget.style.border = "1.5px solid #3b82f6"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)" }}
                      onBlur={e => { e.currentTarget.style.border = "1.5px solid #e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none" }} />
                  </div>

                  {/* Error */}
                  {formError && (
                    <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-[13px]"
                      style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#dc2626" }}>
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {formError}
                    </div>
                  )}

                  {/* Success */}
                  {formSuccess && (
                    <div className="flex flex-col gap-1 rounded-xl px-4 py-3"
                      style={{ background: "linear-gradient(135deg,#ecfdf5 0%,#f0fdf4 100%)", border: "1.5px solid #bbf7d0" }}>
                      <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "#166534" }}>
                        <CheckCircle className="h-4 w-4 flex-shrink-0" /> {formSuccess}
                      </div>
                      {latencia !== null && (
                        <div className="flex items-center gap-2 text-[11px] pl-6" style={{ color: "#15803d" }}>
                          <Clock className="h-3 w-3" /> Latencia de inserción: {latencia} ms
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit */}
                  <button onClick={handleSubmit} disabled={formLoading}
                    className="w-full py-3 rounded-xl text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}
                    onMouseEnter={e => { if (!formLoading) { e.currentTarget.style.boxShadow = "0 6px 20px rgba(59,130,246,0.45)"; e.currentTarget.style.transform = "translateY(-1px)" } }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(29,78,216,0.45)"; e.currentTarget.style.transform = "translateY(0)" }}>
                    {formLoading
                      ? <><div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" /> Guardando...</>
                      : <><PlusCircle className="h-4 w-4" /> Guardar Registro</>}
                  </button>

                </div>
              </div>
            </div>
          )}



          {/* Tab: Mis registros */}

          {tab === "mis-registros" && (
            <div className="rounded-xl overflow-hidden"
              style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f4f8" }}>
                <div>
                  <p className="text-[13px] font-semibold text-slate-700">Mis Registros</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Apuntes guardados en tu biblioteca</p>
                </div>
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
                  style={{ background: "#1e3a5f", color: "#bfdbfe" }}>
                  {registros.length} apuntes
                </span>
              </div>

              {regLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                  </div>
                  <p className="text-[13px] text-slate-400">Cargando registros...</p>
                </div>
              ) : registros.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <BookOpen className="h-8 w-8 text-slate-200" />
                  <p className="text-[13px] text-slate-400">No tienes registros aún</p>
                </div>
              ) : (
                <div className="p-6 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                  {registros.map((r: any, i: number) => {
                    const tipoMap: Record<string, { accent: string; bg: string; light: string; color: string; icon: React.ReactNode }> = {
                      novela: { accent: "#3b82f6", bg: "linear-gradient(135deg,#eff6ff 0%,#fff 60%)", light: "#dbeafe", color: "#1e40af", icon: <BookOpen className="h-4 w-4" style={{ color: "#1d4ed8" }} /> },
                      cuento: { accent: "#f59e0b", bg: "linear-gradient(135deg,#fffbeb 0%,#fff 60%)", light: "#fef3c7", color: "#92400e", icon: <BookOpen className="h-4 w-4" style={{ color: "#92400e" }} /> },
                      poesía: { accent: "#10b981", bg: "linear-gradient(135deg,#ecfdf5 0%,#fff 60%)", light: "#d1fae5", color: "#065f46", icon: <BookOpen className="h-4 w-4" style={{ color: "#065f46" }} /> },
                      ensayo: { accent: "#ec4899", bg: "linear-gradient(135deg,#fdf2f8 0%,#fff 60%)", light: "#fce7f3", color: "#9d174d", icon: <BookOpen className="h-4 w-4" style={{ color: "#9d174d" }} /> },
                      distopía: { accent: "#8b5cf6", bg: "linear-gradient(135deg,#f3f0ff 0%,#fff 60%)", light: "#ede9fe", color: "#5b21b6", icon: <BookOpen className="h-4 w-4" style={{ color: "#5b21b6" }} /> },
                      épica: { accent: "#f97316", bg: "linear-gradient(135deg,#fff7ed 0%,#fff 60%)", light: "#ffedd5", color: "#9a3412", icon: <BookOpen className="h-4 w-4" style={{ color: "#9a3412" }} /> },
                      otro: { accent: "#64748b", bg: "linear-gradient(135deg,#f8fafc 0%,#fff 60%)", light: "#e2e8f0", color: "#334155", icon: <BookOpen className="h-4 w-4" style={{ color: "#334155" }} /> },
                    }
                    const cfg = tipoMap[r.tipo?.toLowerCase()] ?? tipoMap["otro"]

                    return (
                      <div key={i} className="rounded-2xl overflow-hidden transition-all duration-200"
                        style={{
                          background: "#fff",
                          boxShadow: `0 2px 10px ${cfg.accent}22`,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 28px ${cfg.accent}28` }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 2px 10px ${cfg.accent}22` }}>

                        {/* Card top with gradient bg */}
                        <div className="px-5 pt-5 pb-4 relative" style={{ background: cfg.bg }}>
                          {/* Left accent bar */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: cfg.accent }} />

                          {/* Icon */}
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: cfg.light }}>
                            {cfg.icon}
                          </div>

                          {/* Badge */}
                          <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                            style={{ background: cfg.light, color: cfg.color }}>
                            {r.tipo}
                          </span>

                          <p className="text-[14px] font-bold text-slate-800 leading-snug pr-16">{r.titulolibro}</p>
                          <p className="text-[12px] text-slate-500 mt-1 flex items-center gap-1">
                            <span style={{ color: cfg.accent }}>●</span> {r.autor}
                          </p>
                        </div>

                        {/* Divider */}
                        <div style={{ height: "1px", background: "#f1f5f9", margin: "0 20px" }} />

                        {/* Description */}
                        <p className="text-[12px] leading-relaxed px-5 py-3"
                          style={{ color: "#7c8fa0", minHeight: "52px" }}>
                          {r.contenidoreg || <span className="italic text-slate-300">Sin descripción</span>}
                        </p>

                        {/* Footer */}
                        <div className="px-5 pb-4 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {new Date(r.fechareg).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
          {/* Tab: Búsqueda Semántica */}
          {tab === "busqueda" && (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl overflow-hidden"
                style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                {/* Card accent line */}
                <div className="h-[2px]" style={{ background: "#8b5cf6" }} />
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f4f8" }}>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-700">Búsqueda Semántica</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Encuentra tus apuntes por significado o contexto</p>
                  </div>
                  <Search className="h-4 w-4 text-slate-300" />
                </div>
                <div className="px-6 py-5">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input type="text" value={textoBusqueda}
                        onChange={e => { setTextoBusqueda(e.target.value); setBusquedaError("") }}
                        onKeyDown={e => e.key === "Enter" && handleBusqueda()}
                        placeholder="Ej: novela latinoamericana sobre soledad..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg text-[13px] text-slate-700 transition-all"
                        style={{ border: "1px solid #e2e8f0", background: "#fafbfc", outline: "none" }}
                        onFocus={e => { e.currentTarget.style.border = "1px solid #3b82f6"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)" }}
                        onBlur={e => { e.currentTarget.style.border = "1px solid #e2e8f0"; e.currentTarget.style.background = "#fafbfc"; e.currentTarget.style.boxShadow = "none" }} />
                    </div>
                    <button onClick={handleBusqueda} disabled={busquedaLoading}
                      className="px-5 py-2.5 rounded-lg text-white text-[13px] font-medium flex items-center gap-2 transition-all disabled:opacity-70"
                      style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}
                      onMouseEnter={e => !busquedaLoading && (e.currentTarget.style.boxShadow = "0 4px 14px rgba(59,130,246,0.45)")}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(59,130,246,0.3)")}>
                      {busquedaLoading
                        ? <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                        : <Search className="h-4 w-4" />}
                      Buscar
                    </button>
                  </div>
                  {busquedaError && (
                    <div className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: "#dc2626" }}>
                      <AlertTriangle className="h-4 w-4" /> {busquedaError}
                    </div>
                  )}
                </div>
              </div>

              {busquedaResultado && (
                <div className="rounded-xl overflow-hidden"
                  style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f4f8" }}>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-700">
                        Resultados para: <span style={{ color: "#2563eb" }}>"{busquedaResultado.consulta}"</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Ordenados por similitud semántica</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" /> {busquedaResultado.tiempo_ms} ms
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Título", "Autor", "Tipo", "Similitud"].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(busquedaResultado.resultados || []).map((r: any, i: number) => (
                        <tr key={i} style={{ borderTop: "1px solid #f1f4f8" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <td className="px-6 py-3.5">
                            <span className="text-[13px] font-semibold text-slate-700">{r.titulolibro}</span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="text-[13px] text-slate-500">{r.autor}</span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                              style={{ background: "#eff6ff", color: "#2563eb" }}>
                              {r.tipo}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                                <div className="h-full rounded-full" style={{
                                  width: `${(r.similitud * 100).toFixed(0)}%`,
                                  background: "linear-gradient(90deg, #3b82f6, #6366f1)"
                                }} />
                              </div>
                              <span className="text-[12px] font-semibold text-slate-400">{(r.similitud * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(busquedaResultado.resultados || []).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-[13px] text-slate-400">No se encontraron resultados similares</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Botón flotante Agente IA */}
      <button
        onClick={() => setShowN8n(v => !v)}
        className="fixed bottom-6 right-6 z-40 bg-[#2d5a9b] hover:bg-[#244a82] text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2 transition-colors"
        title="Consultar agente IA"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Agente IA</span>
      </button>

      {/* Popout n8n — siempre montado para conservar el historial */}
      <N8nPopout onClose={() => setShowN8n(false)} visible={showN8n} />
    </div>
  )
}
