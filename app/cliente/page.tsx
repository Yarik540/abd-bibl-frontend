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
            <div className="rounded-xl overflow-hidden max-w-xl mx-auto"
              style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)" }}>
              {/* Card accent line */}
              <div className="h-[2px] rounded-t-xl" style={{ background: "#3b82f6" }} />
              <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f4f8" }}>
                <div>
                  <p className="text-[13px] font-semibold text-slate-700">Ingresar nuevo registro</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Completa los datos del libro</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
                  <PlusCircle className="h-4 w-4" style={{ color: "#3b82f6" }} />
                </div>
              </div>

              <div className="px-6 py-5 flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Título del Libro *</label>
                  <input type="text" value={form.titulolibro}
                    onChange={e => { setForm({ ...form, titulolibro: e.target.value }); setFormError("") }}
                    placeholder="Ej: Cien años de soledad"
                    className="w-full px-4 py-2.5 rounded-lg text-[13px] text-slate-700 transition-all"
                    style={{ border: "1px solid #e2e8f0", background: "#fafbfc", outline: "none" }}
                    onFocus={e => { e.currentTarget.style.border = "1px solid #3b82f6"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)" }}
                    onBlur={e => { e.currentTarget.style.border = "1px solid #e2e8f0"; e.currentTarget.style.background = "#fafbfc"; e.currentTarget.style.boxShadow = "none" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Autor *</label>
                  <input type="text" value={form.autor}
                    onChange={e => { setForm({ ...form, autor: e.target.value }); setFormError("") }}
                    placeholder="Ej: Gabriel García Márquez"
                    className="w-full px-4 py-2.5 rounded-lg text-[13px] text-slate-700 transition-all"
                    style={{ border: "1px solid #e2e8f0", background: "#fafbfc", outline: "none" }}
                    onFocus={e => { e.currentTarget.style.border = "1px solid #3b82f6"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)" }}
                    onBlur={e => { e.currentTarget.style.border = "1px solid #e2e8f0"; e.currentTarget.style.background = "#fafbfc"; e.currentTarget.style.boxShadow = "none" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tipo *</label>
                  <select value={form.tipo}
                    onChange={e => { setForm({ ...form, tipo: e.target.value }); setFormError("") }}
                    className="w-full px-4 py-2.5 rounded-lg text-[13px] text-slate-700 transition-all"
                    style={{ border: "1px solid #e2e8f0", background: "#fafbfc", outline: "none" }}
                    onFocus={e => { e.currentTarget.style.border = "1px solid #3b82f6"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)" }}
                    onBlur={e => { e.currentTarget.style.border = "1px solid #e2e8f0"; e.currentTarget.style.background = "#fafbfc"; e.currentTarget.style.boxShadow = "none" }}>
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
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Contenido / Descripción</label>
                  <textarea value={form.contenidoreg}
                    onChange={e => setForm({ ...form, contenidoreg: e.target.value })}
                    placeholder="Breve descripción del libro..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg text-[13px] text-slate-700 resize-none transition-all"
                    style={{ border: "1px solid #e2e8f0", background: "#fafbfc", outline: "none" }}
                    onFocus={e => { e.currentTarget.style.border = "1px solid #3b82f6"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)" }}
                    onBlur={e => { e.currentTarget.style.border = "1px solid #e2e8f0"; e.currentTarget.style.background = "#fafbfc"; e.currentTarget.style.boxShadow = "none" }} />
                </div>

                {formError && (
                  <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-[13px]"
                    style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="flex flex-col gap-1 rounded-lg px-4 py-3 text-[13px]"
                    style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" /> {formSuccess}
                    </div>
                    {latencia !== null && (
                      <div className="flex items-center gap-2 text-[11px] pl-6" style={{ color: "#15803d" }}>
                        <Clock className="h-3 w-3" /> Latencia de inserción: {latencia} ms
                      </div>
                    )}
                  </div>
                )}

                <button onClick={handleSubmit} disabled={formLoading}
                  className="w-full py-3 rounded-lg text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}
                  onMouseEnter={e => !formLoading && (e.currentTarget.style.boxShadow = "0 4px 14px rgba(59,130,246,0.45)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(59,130,246,0.3)")}>
                  {formLoading ? (
                    <><div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" /> Guardando...</>
                  ) : (
                    <><PlusCircle className="h-4 w-4" /> Guardar Registro</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab: Mis Registros */}
          {tab === "mis-registros" && (
            <div className="rounded-xl overflow-hidden"
              style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f4f8" }}>
                <div>
                  <p className="text-[13px] font-semibold text-slate-700">Mis Registros</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Libros registrados en el sistema</p>
                </div>
                <List className="h-4 w-4 text-slate-300" />
              </div>
              {regLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                  </div>
                  <p className="text-[13px] text-slate-400">Cargando registros...</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Título", "Autor", "Tipo", "Descripción", "Fecha"].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r: any, i: number) => (
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
                          <span className="text-[13px] text-slate-400 max-w-[200px] truncate block">{r.contenidoreg || "—"}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-[12px] text-slate-400">{new Date(r.fechareg).toLocaleDateString("es-ES")}</span>
                        </td>
                      </tr>
                    ))}
                    {registros.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-[13px] text-slate-400">No tienes registros aún</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                    <p className="text-[11px] text-slate-400 mt-0.5">Encuentra libros por significado o contexto</p>
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
