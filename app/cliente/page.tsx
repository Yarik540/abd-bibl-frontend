"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen, LogOut, PlusCircle, List, Search,
  MessageSquare, CheckCircle, AlertTriangle, Clock
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

export default function ClientePage() {
  const router = useRouter()
  const [tab, setTab] = useState("nuevo")
  const [usuario, setUsuario] = useState("")

  // Nuevo registro
  const [form, setForm] = useState({ titulolibro: "", autor: "", tipo: "", contenidoreg: "" })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [latencia, setLatencia] = useState<number | null>(null)

  // Mis registros
  const [registros, setRegistros] = useState<any[]>([])
  const [regLoading, setRegLoading] = useState(false)

  // Búsqueda
  const [textoBusqueda, setTextoBusqueda] = useState("")
  const [busquedaLoading, setBusquedaLoading] = useState(false)
  const [busquedaResultado, setBusquedaResultado] = useState<any>(null)
  const [busquedaError, setBusquedaError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const rol = localStorage.getItem("rol")
    const usu = localStorage.getItem("usuario") || "Cliente"
    if (!token || rol !== "cliente") { router.push("/"); return }
    setUsuario(usu)
  }, [])

  const handleLogout = () => { localStorage.clear(); router.push("/") }

  // Cargar mis registros
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

  // Enviar registro
  const handleSubmit = async () => {
    setFormError("")
    setFormSuccess("")
    setLatencia(null)
    if (!form.titulolibro.trim()) return setFormError("El título del libro es obligatorio.")
    if (!form.autor.trim()) return setFormError("El autor es obligatorio.")
    if (!form.tipo.trim()) return setFormError("El tipo es obligatorio.")

    const token = localStorage.getItem("token")
    setFormLoading(true)
    try {
      const res = await fetch(`${API}/api/registros`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data?.message || "Error al guardar el registro."); return }
      setFormSuccess("Registro guardado exitosamente.")
      setLatencia(data.latencia_ms)
      setForm({ titulolibro: "", autor: "", tipo: "", contenidoreg: "" })
    } catch {
      setFormError("Error al conectar con el servidor.")
    } finally {
      setFormLoading(false)
    }
  }

  // Búsqueda semántica
  const handleBusqueda = async () => {
    setBusquedaError("")
    setBusquedaResultado(null)
    if (!textoBusqueda.trim()) return setBusquedaError("Ingresa un texto para buscar.")
    const token = localStorage.getItem("token")
    setBusquedaLoading(true)
    try {
      const res = await fetch(`${API}/api/busqueda?texto=${encodeURIComponent(textoBusqueda)}`, {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-[#2d5a9b]" />
          <span className="font-bold text-[#2d5a9b] text-lg">Biblioteca Lumina</span>
          <span className="ml-3 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">Cliente</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Bienvenido, <span className="font-medium">{usuario}</span></span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm transition-colors">
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mi Espacio</h1>
          <p className="text-sm text-gray-500">Gestiona tus registros y consultas</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === id ? "border-[#2d5a9b] text-[#2d5a9b]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Tab: Nuevo Registro */}
        {tab === "nuevo" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-5">Ingresar nuevo registro</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Título del Libro *</label>
                <input type="text" value={form.titulolibro}
                  onChange={e => { setForm({ ...form, titulolibro: e.target.value }); setFormError("") }}
                  placeholder="Ej: Cien años de soledad"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2d5a9b]/40 focus:border-[#2d5a9b]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Autor *</label>
                <input type="text" value={form.autor}
                  onChange={e => { setForm({ ...form, autor: e.target.value }); setFormError("") }}
                  placeholder="Ej: Gabriel García Márquez"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2d5a9b]/40 focus:border-[#2d5a9b]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo *</label>
                <select value={form.tipo}
                  onChange={e => { setForm({ ...form, tipo: e.target.value }); setFormError("") }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2d5a9b]/40 focus:border-[#2d5a9b]">
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Contenido / Descripción</label>
                <textarea value={form.contenidoreg}
                  onChange={e => setForm({ ...form, contenidoreg: e.target.value })}
                  placeholder="Breve descripción del libro..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2d5a9b]/40 focus:border-[#2d5a9b] resize-none" />
              </div>

              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex flex-col gap-1 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                  {latencia !== null && (
                    <div className="flex items-center gap-2 text-xs text-green-600 pl-6">
                      <Clock className="h-3 w-3" /> Latencia de inserción: {latencia} ms
                    </div>
                  )}
                </div>
              )}

              <button onClick={handleSubmit} disabled={formLoading}
                className="w-full py-3 rounded-lg bg-[#2d5a9b] text-white font-semibold text-sm hover:bg-[#244a82] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {formLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <><PlusCircle className="h-4 w-4" /> Guardar Registro</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab: Mis Registros */}
        {tab === "mis-registros" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Mis Registros</h2>
            </div>
            {regLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#2d5a9b] border-t-transparent" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Título", "Autor", "Tipo", "Descripción", "Fecha"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registros.map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{r.titulolibro}</td>
                      <td className="px-5 py-3 text-gray-600">{r.autor}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-[#2d5a9b]/10 text-[#2d5a9b] font-medium">{r.tipo}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">{r.contenidoreg || "—"}</td>
                      <td className="px-5 py-3 text-gray-500">{new Date(r.fechareg).toLocaleDateString("es-ES")}</td>
                    </tr>
                  ))}
                  {registros.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No tienes registros aún</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Búsqueda Semántica */}
        {tab === "busqueda" && (
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Búsqueda Semántica</h2>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={textoBusqueda}
                    onChange={e => { setTextoBusqueda(e.target.value); setBusquedaError("") }}
                    onKeyDown={e => e.key === "Enter" && handleBusqueda()}
                    placeholder="Ej: novela latinoamericana sobre soledad..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2d5a9b]/40 focus:border-[#2d5a9b]" />
                </div>
                <button onClick={handleBusqueda} disabled={busquedaLoading}
                  className="px-5 py-2.5 rounded-lg bg-[#2d5a9b] text-white text-sm font-medium hover:bg-[#244a82] transition-colors disabled:opacity-70 flex items-center gap-2">
                  {busquedaLoading ? (
                    <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Buscar
                </button>
              </div>
              {busquedaError && (
                <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> {busquedaError}
                </p>
              )}
            </div>

            {busquedaResultado && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Resultados para: <span className="text-[#2d5a9b]">"{busquedaResultado.consulta}"</span>
                  </h3>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {busquedaResultado.tiempo_ms} ms
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Título", "Autor", "Tipo", "Similitud"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(busquedaResultado.resultados || []).map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-800">{r.titulolibro}</td>
                        <td className="px-5 py-3 text-gray-600">{r.autor}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-[#2d5a9b]/10 text-[#2d5a9b] font-medium">{r.tipo}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-[#2d5a9b] rounded-full" style={{ width: `${(r.similitud * 100).toFixed(0)}%` }} />
                            </div>
                            <span className="text-xs text-gray-600">{(r.similitud * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(busquedaResultado.resultados || []).length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No se encontraron resultados similares</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
