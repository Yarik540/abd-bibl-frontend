"use client"

import { useEffect, useState } from "react"
import N8nPopout from "@/components/N8nPopout"
import { useRouter } from "next/navigation"
import {
    LayoutDashboard, Users, FileText, LogOut,
    BookOpen, CheckCircle, XCircle, AlertTriangle,
    Activity, ChevronLeft, ChevronRight,
    MessageCircle
} from "lucide-react"

const API = "https://abd-eva-2026-production.up.railway.app"

const MOCK_LOGS = [
    { accion: "insertar_registro", estado: "exito", latencia_ms: 210, mensajelog: "Registro insertado: Cien años de soledad", idusu: "b2c3d4e5-f6a7-8901", fechalog: "2025-05-10T14:22:00" },
    { accion: "busqueda_semantica", estado: "exito", latencia_ms: 187, mensajelog: "Búsqueda exitosa: 'novela García'", idusu: "c3d4e5f6-a7b8-9012", fechalog: "2025-05-10T13:10:00" },
    { accion: "insertar_registro", estado: "error", latencia_ms: 0, mensajelog: "Validación fallida: título vacío", idusu: "b2c3d4e5-f6a7-8901", fechalog: "2025-05-09T09:00:00" },
    { accion: "busqueda_semantica", estado: "error", latencia_ms: 0, mensajelog: "Búsqueda fallida: texto vacío", idusu: "d4e5f6a7-b8c9-0123", fechalog: "2025-05-09T08:30:00" },
    { accion: "insertar_registro", estado: "exito", latencia_ms: 340, mensajelog: "Registro insertado: Don Quijote", idusu: "d4e5f6a7-b8c9-0123", fechalog: "2025-05-08T16:45:00" },
    { accion: "insertar_registro", estado: "exito", latencia_ms: 290, mensajelog: "Registro insertado: La Odisea", idusu: "e5f6a7b8-c9d0-1234", fechalog: "2025-05-08T15:20:00" },
    { accion: "insertar_registro", estado: "error", latencia_ms: 0, mensajelog: "Validación fallida: autor obligatorio", idusu: "b2c3d4e5-f6a7-8901", fechalog: "2025-05-07T11:00:00" },
]

const MOCK_RESUMEN = {
    total_logs: 7,
    total_exitosos: 4,
    total_errores: 3,
    por_accion: [
        { accion: "insertar_registro", total: 5, exitosos: 3, errores: 2, latencia_promedio_ms: 210 },
        { accion: "busqueda_semantica", total: 2, exitosos: 1, errores: 1, latencia_promedio_ms: 93.5 },
    ],
    errores_por_usuario: [
        { idusu: "b2c3d4e5-f6a7-8901", total_errores: 2 },
        { idusu: "d4e5f6a7-b8c9-0123", total_errores: 1 },
    ],
}

const PAGE_SIZE = 10

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
    { href: "/admin/logs", label: "Logs", icon: FileText },
]

function Sidebar({ active }: { active: string }) {
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
                <p className="text-[11px] text-slate-500 ml-10">Panel Administrador</p>
            </div>

            {/* Divider */}
            <div className="mx-6 mb-5" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

            {/* Nav */}
            <nav className="flex-1 px-3 flex flex-col gap-0.5">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = href === active
                    return (
                        <a key={href} href={href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                            style={{
                                color: isActive ? "#fff" : "rgba(148,163,184,0.8)",
                                background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                                borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent"
                            }}>
                            <Icon className="h-4 w-4 flex-shrink-0" style={{ color: isActive ? "#60a5fa" : "rgba(148,163,184,0.6)" }} />
                            {label}
                        </a>
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

function StatCard({ icon: Icon, label, value, accent }: {
    icon: any, label: string, value: string | number, accent: string
}) {
    return (
        <div className="rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden"
            style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl" style={{ background: accent }} />
            <div className="flex items-start justify-between">
                <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide leading-tight">{label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accent}18` }}>
                    <Icon className="h-4 w-4" style={{ color: accent }} />
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
            </div>
        </div>
    )
}

export default function LogsPage() {
    const router = useRouter()
    const [logs, setLogs] = useState<any[]>([])
    const [resumen, setResumen] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [filtroEstado, setFiltroEstado] = useState("")
    const [filtroAccion, setFiltroAccion] = useState("")
    const [pagina, setPagina] = useState(1)
    const [showN8n, setShowN8n] = useState(false)

    const fetchLogs = async (estado: string, accion: string) => {
        const token = localStorage.getItem("token")
        setLoading(true)
        setPagina(1)
        try {
            let query = `${API}/api/logs?limit=50`
            if (estado) query += `&estado=${estado}`
            if (accion) query += `&accion=${accion}`
            const [resLogs, resResumen] = await Promise.all([
                fetch(query, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API}/api/logs/resumen`, { headers: { Authorization: `Bearer ${token}` } }),
            ])
            if (!resLogs.ok || !resResumen.ok) throw new Error()
            setLogs(await resLogs.json())
            setResumen(await resResumen.json())
        } catch {
            setLogs(MOCK_LOGS)
            setResumen(MOCK_RESUMEN)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token")
        const rol = localStorage.getItem("rol")
        if (!token || rol !== "administrador") { router.push("/"); return }
        fetchLogs("", "")
    }, [])

    const handleFiltrar = () => fetchLogs(filtroEstado, filtroAccion)
    const r = resumen || MOCK_RESUMEN

    const totalPaginas = Math.ceil(logs.length / PAGE_SIZE)
    const logsPagina = logs.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

    const estadoBadge = (estado: string) => {
        const map: Record<string, { bg: string; color: string }> = {
            exito: { bg: "#f0fdf4", color: "#16a34a" },
            error: { bg: "#fef2f2", color: "#dc2626" },
            sin_resultado: { bg: "#fffbeb", color: "#d97706" },
            detectado: { bg: "#eff6ff", color: "#2563eb" },
        }
        const s = map[estado] || { bg: "#f1f5f9", color: "#64748b" }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ background: s.bg, color: s.color }}>
                <span className="w-1 h-1 rounded-full" style={{ background: s.color }} />
                {estado}
            </span>
        )
    }

    if (loading && logs.length === 0) return (
        <div className="flex min-h-screen items-center justify-center" style={{ background: "#f4f6f9" }}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Cargando logs...</p>
            </div>
        </div>
    )

    return (
        <div className="flex min-h-screen" style={{ background: "#f4f6f9", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
            <Sidebar active="/admin/logs" />

            <main className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between"
                    style={{ background: "rgba(244,246,249,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div>
                        <h1 className="text-[18px] font-bold text-slate-800 leading-tight">Logs del Sistema</h1>
                        <p className="text-[12px] text-slate-400">Historial de operaciones y errores</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-slate-500"
                        style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Sistema activo
                    </div>
                </header>

                <div className="flex-1 px-8 py-6 overflow-y-auto">

                    {/* Stat cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <StatCard icon={FileText} label="Total Logs" value={r.total_logs} accent="#3b82f6" />
                        <StatCard icon={CheckCircle} label="Total Exitosos" value={r.total_exitosos} accent="#10b981" />
                        <StatCard icon={XCircle} label="Total Errores" value={r.total_errores} accent="#ef4444" />
                    </div>

                    {/* Filtros */}
                    <div className="flex items-center gap-3 mb-5 p-4 rounded-xl"
                        style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                            className="px-3 py-2 rounded-lg text-[13px] text-slate-700 focus:outline-none transition-all"
                            style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <option value="">Todos los estados</option>
                            <option value="exito">Éxito</option>
                            <option value="error">Error</option>
                            <option value="sin_resultado">Sin resultado</option>
                            <option value="detectado">Detectado</option>
                        </select>
                        <select value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}
                            className="px-3 py-2 rounded-lg text-[13px] text-slate-700 focus:outline-none transition-all"
                            style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <option value="">Todas las acciones</option>
                            <option value="busqueda_semantica">busqueda_semantica</option>
                            <option value="generar_embedding">generar_embedding</option>
                            <option value="insertar_registro">insertar_registro</option>
                            <option value="login">login</option>
                            <option value="logout">logout</option>
                            <option value="registro_duplicado">registro_duplicado</option>
                        </select>
                        <button onClick={handleFiltrar}
                            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all"
                            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}>
                            Filtrar
                        </button>
                        <button onClick={() => { setFiltroEstado(""); setFiltroAccion(""); fetchLogs("", "") }}
                            className="px-4 py-2 rounded-lg text-[13px] font-medium text-slate-600 transition-all"
                            style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                            Limpiar
                        </button>
                    </div>

                    {/* Tabla logs */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl overflow-hidden mb-5"
                            style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f4f8" }}>
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-700">Registros de actividad</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{logs.length} entradas encontradas</p>
                                </div>
                                <Activity className="h-4 w-4 text-slate-300" />
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ background: "#f8fafc" }}>
                                        {["Acción", "Estado", "Latencia", "Mensaje", "Usuario", "Fecha"].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {logsPagina.map((l: any, i: number) => (
                                        <tr key={i} style={{ borderTop: "1px solid #f1f4f8" }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                            <td className="px-6 py-3.5">
                                                <span className="text-[13px] font-semibold text-slate-700">{l.accion}</span>
                                            </td>
                                            <td className="px-6 py-3.5">{estadoBadge(l.estado)}</td>
                                            <td className="px-6 py-3.5">
                                                <span className="text-[13px] text-slate-500">{l.latencia_ms ?? 0} ms</span>
                                            </td>
                                            <td className="px-6 py-3.5 max-w-[220px]">
                                                <span className="text-[13px] text-slate-500 truncate block">{l.mensajelog}</span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="text-[13px] font-semibold text-slate-700">{l.nombre ?? "desconocido"}</span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="text-[12px] text-slate-400">
                                                    {new Date(`${l.fechalog}Z`).toLocaleString("es-EC", {
    timeZone: "America/Guayaquil",
    hour12: false
})}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {logsPagina.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-[13px] text-slate-400">
                                                No hay logs que mostrar
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Paginación */}
                            {totalPaginas > 1 && (
                                <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: "1px solid #f1f4f8" }}>
                                    <p className="text-[12px] text-slate-400">
                                        Mostrando {(pagina - 1) * PAGE_SIZE + 1}–{Math.min(pagina * PAGE_SIZE, logs.length)} de {logs.length} logs
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setPagina(p => Math.max(1, p - 1))}
                                                disabled={pagina === 1}
                                                className="p-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                style={{ border: "1px solid #e2e8f0", color: "#64748b" }}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => setPagina(n)}
                                                    className="w-8 h-8 rounded-lg text-[12px] font-semibold transition-all"
                                                    style={n === pagina
                                                        ? { background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff" }
                                                        : { border: "1px solid #e2e8f0", color: "#64748b" }}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                                                disabled={pagina === totalPaginas}
                                                className="p-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                style={{ border: "1px solid #e2e8f0", color: "#64748b" }}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resumen por acción */}
                    <div className="rounded-xl overflow-hidden mb-5"
                        style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #f1f4f8" }}>
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <p className="text-[13px] font-semibold text-slate-700">Resumen por Acción</p>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    {["Acción", "Total", "Exitosos", "Errores", "Latencia Promedio"].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(r.por_accion ?? []).map((a: any, i: number) => (
                                    <tr key={i} style={{ borderTop: "1px solid #f1f4f8" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                        <td className="px-6 py-3.5">
                                            <span className="text-[13px] font-semibold text-slate-700">{a.accion}</span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="text-[13px] text-slate-600">{a.total}</span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                                style={{ background: "#f0fdf4", color: "#16a34a" }}>{a.exitosos}</span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                                style={{ background: "#fef2f2", color: "#dc2626" }}>{a.errores}</span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="text-[13px] text-slate-500">{a.latencia_promedio_ms} ms</span>
                                        </td>
                                    </tr>
                                ))}
                                {(r.por_accion ?? []).length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-[13px] text-slate-400">Sin datos</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Errores por usuario */}
                    <div className="rounded-xl overflow-hidden"
                        style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #f1f4f8" }}>
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <p className="text-[13px] font-semibold text-slate-700">Errores por Usuario</p>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Total Errores
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(r.errores_por_usuario ?? []).map((e: any, i: number) => (
                                    <tr key={i} style={{ borderTop: "1px solid #f1f4f8" }}
                                        onMouseEnter={ev => (ev.currentTarget.style.background = "#fafbfc")}
                                        onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                                        <td className="px-6 py-3.5">
                                            {/* Mostrar solo el nombre */}
                                            <span className="text-[12px] font-semibold text-slate-700">{e.nombre}</span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                                style={{ background: "#fef2f2", color: "#dc2626" }}>
                                                {e.total_errores}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(r.errores_por_usuario ?? []).length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-8 text-center text-[13px] text-slate-400">
                                            Sin errores registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>


                </div>
            </main>
        </div>
    )
}