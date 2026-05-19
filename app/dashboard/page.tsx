"use client"

import { useEffect, useState } from "react"
import N8nPopout from "@/components/N8nPopout"
import { useRouter } from "next/navigation"
import {
    LayoutDashboard, Users, FileText, LogOut,
    BookOpen, AlertTriangle, CheckCircle, MessageSquare,
    Clock, Database, TrendingUp, XCircle, Zap,
    PlusCircle, List, Search, MessageCircle, ChevronRight,
    Activity, BarChart2
} from "lucide-react"

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts"

const API = "https://abd-eva-2026-production.up.railway.app"

const MOCK = {
    resumen: {
        total_registros: 128,
        total_usuarios: 5,
        total_errores: 7,
        tasa_exito: 94.53,
        total_consultas_agente: 43,
    },
    rendimiento_vectorial: {
        latencia_promedio_ms: 312,
        tiempo_promedio_consulta_semantica_ms: 187,
        tiempo_promedio_generacion_embeddings_m: 1113,
        total_vectores_almacenados: 128,
    },
    actividad_usuarios: {
        registros_por_usuario: [
            { nombre: "Manuel", total: 34 },
            { nombre: "Victor", total: 21 },
            { nombre: "Yarik Gonzales", total: 18 },
            { nombre: "Admin Test", total: 55 },
        ],
        ultimos_registros: [
            { nombre: "Manuel", titulolibro: "Cien años de soledad", autor: "García Márquez", tipo: "novela", fechareg: "2025-05-10T14:22:00" },
            { nombre: "Victor", titulolibro: "El principito", autor: "Saint-Exupéry", tipo: "cuento", fechareg: "2025-05-09T10:11:00" },
            { nombre: "Yarik Gonzales", titulolibro: "1984", autor: "Orwell", tipo: "distopía", fechareg: "2025-05-08T08:45:00" },
            { nombre: "Admin Test", titulolibro: "Don Quijote", autor: "Cervantes", tipo: "novela", fechareg: "2025-05-07T16:30:00" },
            { nombre: "Manuel", titulolibro: "La Odisea", autor: "Homero", tipo: "épica", fechareg: "2025-05-06T09:00:00" },
        ],
    },
    calidad_datos: {
        registros_incompletos: 5,
        registros_duplicados_o_similares: 9,
        nivel_promedio_similitud: 0.92,
        // registros_rechazados eliminado del mock porque ya no lo mostramos en frontend
        ultimos_errores: [
            { nombre: "Victor", accion: "insertar_registro", estado: "error", mensajelog: "Título vacío", fechalog: "2025-05-10T13:00:00" },
            { nombre: "Yarik Gonzales", accion: "busqueda_semantica", estado: "error", mensajelog: "Texto vacío", fechalog: "2025-05-09T11:30:00" },
        ],
    },
    agente_conversacional: {
        total_preguntas: 43,
        consultas_exitosas: 38,
        consultas_sin_resultados: 5,
        preguntas_frecuentes: [
            { pregunta: "¿Cuántos registros tengo?", frecuencia: 12 },
            { pregunta: "¿Qué libros he guardado?", frecuencia: 8 },
            { pregunta: "¿Cuál es mi último registro?", frecuencia: 6 },
            { pregunta: "¿Tengo libros de poesía?", frecuencia: 5 },
            { pregunta: "¿Cuántos autores distintos tengo?", frecuencia: 4 },
        ]
    },
}

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
    { href: "/admin/logs", label: "Logs", icon: FileText },
]

function Sidebar() {
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
                    const active = href === "/dashboard"
                    return (
                        <a key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                            style={{
                                color: active ? "#fff" : "rgba(148,163,184,0.8)",
                                background: active ? "rgba(59,130,246,0.15)" : "transparent",
                                borderLeft: active ? "2px solid #3b82f6" : "2px solid transparent"
                            }}>
                            <Icon className="h-4 w-4 flex-shrink-0" style={{ color: active ? "#60a5fa" : "rgba(148,163,184,0.6)" }} />
                            {label}
                        </a>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="px-3 pb-5 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] w-full transition-all"
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

function StatCard({ icon: Icon, label, value, accent, sub }: {
    icon: any, label: string, value: string | number, accent: string, sub?: string
}) {
    return (
        <div className="rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden"
            style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)" }}>
            {/* Top accent line */}
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
                {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
            </div>
        </div>
    )
}

const TABS = [
    { label: "Resumen", icon: LayoutDashboard },
    { label: "Rendimiento Vectorial", icon: Zap },
    { label: "Actividad de Usuarios", icon: Users },
    { label: "Calidad de Datos", icon: CheckCircle },
    { label: "Agente IA", icon: MessageSquare },
]

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 14px" }}>
                <p style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "4px" }}>{label}</p>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: "15px" }}>{payload[0].value}</p>
            </div>
        )
    }
    return null
}

export default function DashboardPage() {
    const router = useRouter()
    const [tab, setTab] = useState(0)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showN8n, setShowN8n] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        const rol = localStorage.getItem("rol")
        if (!token || rol !== "administrador") { router.push("/"); return }

        const fetchData = async () => {
            try {
                const [resMain, resAgente] = await Promise.all([
                    fetch(`${API}/api/Dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API}/api/Consultas/metricas`, { headers: { Authorization: `Bearer ${token}` } }),
                ])
                const jsonMain = await resMain.json()
                const jsonAgente = resAgente.ok ? await resAgente.json() : MOCK.agente_conversacional
                setData({ ...jsonMain, agente_conversacional: jsonAgente })
            } catch {
                setData(MOCK)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center" style={{ background: "#f7f8fa" }}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Cargando dashboard...</p>
            </div>
        </div>
    )

    const d = data || MOCK

    return (
        <div className="flex min-h-screen" style={{ background: "#f4f6f9", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between"
                    style={{ background: "rgba(244,246,249,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div>
                        <h1 className="text-[18px] font-bold text-slate-800 leading-tight">Dashboard</h1>
                        <p className="text-[12px] text-slate-400">Métricas generales del sistema</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-slate-500"
                        style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Sistema activo
                    </div>
                </header>

                <div className="flex-1 px-8 py-6">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
                        style={{ background: "#e8ecf2" }}>
                        {TABS.map(({ label, icon: Icon }, i) => (
                            <button key={i} onClick={() => setTab(i)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
                                style={{
                                    background: tab === i ? "#fff" : "transparent",
                                    color: tab === i ? "#1e40af" : "#64748b",
                                    boxShadow: tab === i ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                                }}>
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Tab 0: Resumen */}
                    {tab === 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard icon={BookOpen} label="Total Registros" value={d.resumen.total_registros} accent="#3b82f6" sub="libros en el sistema" />
                            <StatCard icon={Users} label="Total Usuarios" value={d.resumen.total_usuarios} accent="#6366f1" sub="usuarios activos" />
                            <StatCard icon={AlertTriangle} label="Total Errores" value={d.resumen.total_errores} accent="#ef4444" sub="en el periodo actual" />
                            <StatCard icon={TrendingUp} label="Tasa de Éxito" value={`${d.resumen.tasa_exito}%`} accent="#10b981" sub="operaciones exitosas" />
                            <StatCard icon={MessageSquare} label="Consultas al Agente" value={d.resumen.total_consultas_agente} accent="#8b5cf6" sub="interacciones registradas" />
                        </div>
                    )}

                    {/* Tab 1: Rendimiento Vectorial */}
                    {tab === 1 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard icon={Clock} label="Latencia Promedio Inserción" value={`${Number(d.rendimiento_vectorial.latencia_promedio_ms).toFixed(3)} ms`} accent="#f59e0b" />
                            <StatCard icon={Zap} label="Consulta Semántica" value={`${d.rendimiento_vectorial.tiempo_promedio_consulta_semantica_ms} ms`} accent="#3b82f6" />
                            <StatCard icon={CheckCircle} label="Generación Embeddings" value={`${d.rendimiento_vectorial.tiempo_promedio_generacion_embeddings_ms} ms`} accent="#10b981" />
                            <StatCard icon={Database} label="Vectores Almacenados" value={d.rendimiento_vectorial.total_vectores_almacenados} accent="#8b5cf6" />
                        </div>
                    )}

                    {/* Tab 2: Actividad de Usuarios */}
                    {tab === 2 && (
                        <div className="flex flex-col gap-5">
                            <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f4f8" }}>
                                    <div>
                                        <p className="text-[13px] font-semibold text-slate-700">Registros por Usuario</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Distribución de contribuciones</p>
                                    </div>
                                    <BarChart2 className="h-4 w-4 text-slate-300" />
                                </div>
                                <div className="px-4 py-5">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart
                                            data={Array.isArray(d.actividad_usuarios?.registros_por_usuario)
                                                ? d.actividad_usuarios.registros_por_usuario.map((r: any) => ({
                                                    ...r,
                                                    nombre: r.nombre
                                                }))
                                                : []}
                                            barSize={36}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f4f8" vertical={false} />
                                            <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.04)" }} />
                                            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                                {Array.isArray(d.actividad_usuarios?.registros_por_usuario) &&
                                                    d.actividad_usuarios.registros_por_usuario.map((_: any, i: number) => (
                                                        <Cell key={i} fill={["#3b82f6", "#6366f1", "#8b5cf6", "#0ea5e9"][i % 4]} />
                                                    ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>

                                </div>
                            </div>

                            <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f4f8" }}>
                                    <div>
                                        <p className="text-[13px] font-semibold text-slate-700">Últimos 5 Registros</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Actividad reciente del sistema</p>
                                    </div>
                                    <Activity className="h-4 w-4 text-slate-300" />
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ background: "#f8fafc" }}>
                                            {["Estudiante", "Título", "Autor", "Tipo", "Fecha"].map(h => (
                                                <th
                                                    key={h}
                                                    className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(d.actividad_usuarios?.ultimos_registros) &&
                                            d.actividad_usuarios.ultimos_registros.map((r: any, i: number) => (
                                                <tr key={i} style={{ borderTop: "1px solid #f1f4f8" }}>
                                                    <td className="px-6 py-3.5">
                                                        <span className="text-[13px] font-semibold text-slate-700">{r.nombre}</span>
                                                    </td>
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
                                                        <span className="text-[12px] text-slate-400">
                                                            {new Date(r.fechareg).toLocaleDateString("es-ES")}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>

                                </table>

                            </div>
                        </div>
                    )}

                    {/* Tab 3: Calidad de Datos */}
                    {tab === 3 && (
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <StatCard icon={AlertTriangle} label="Registros Incompletos" value={d.calidad_datos.registros_incompletos} accent="#f59e0b" />
                                <StatCard icon={XCircle} label="Duplicados o Similares" value={d.calidad_datos.registros_duplicados_o_similares} accent="#ef4444" />
                                <StatCard icon={TrendingUp} label="Similitud Promedio" value={d.calidad_datos.nivel_promedio_similitud} accent="#10b981" />
                                {/* Tarjeta de Registros Rechazados eliminada */}
                            </div>

                            <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #f1f4f8" }}>
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                    <p className="text-[13px] font-semibold text-slate-700">Últimos Errores</p>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ background: "#f8fafc" }}>
                                            {["Estudiante", "Acción", "Estado", "Mensaje", "Fecha"].map(h => (
                                                <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(d.calidad_datos?.ultimos_errores) &&
                                            d.calidad_datos.ultimos_errores.map((e: any, i: number) => (
                                                <tr key={i} style={{ borderTop: "1px solid #f1f4f8" }}
                                                    onMouseEnter={ev => (ev.currentTarget.style.background = "#fafbfc")}
                                                    onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                                                    <td className="px-6 py-3.5">
                                                        <span className="text-[13px] font-semibold text-slate-700">{e.nombre}</span>
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <span className="text-[13px] font-medium text-slate-600">{e.accion}</span>
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                                            style={{ background: "#fef2f2", color: "#dc2626" }}>
                                                            <span className="w-1 h-1 rounded-full bg-red-400" />
                                                            {e.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <span className="text-[13px] text-slate-500">{e.mensajelog}</span>
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <span className="text-[12px] text-slate-400">
                                                            {new Date(e.fechalog).toLocaleDateString("es-ES")}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    )}


                    {/* Tab 4: Agente Conversacional */}
                    {tab === 4 && (
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard icon={MessageSquare} label="Total Preguntas" value={d.agente_conversacional.total_preguntas} accent="#8b5cf6" />
                                <StatCard icon={CheckCircle} label="Consultas Exitosas" value={d.agente_conversacional.consultas_exitosas} accent="#10b981" />
                                <StatCard icon={XCircle} label="Sin Resultados" value={d.agente_conversacional.consultas_sin_resultados} accent="#ef4444" />
                                <StatCard icon={TrendingUp} label="Tasa de Éxito"
                                    value={`${((d.agente_conversacional.consultas_exitosas / d.agente_conversacional.total_preguntas) * 100).toFixed(1)}%`}
                                    accent="#3b82f6" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                                {/* Preguntas frecuentes */}
                                <div className="lg:col-span-3 rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                    <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f4f8" }}>
                                        <p className="text-[13px] font-semibold text-slate-700">Top 5 Preguntas Frecuentes</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Consultas más comunes al agente</p>
                                    </div>
                                    <div className="px-6 py-2 divide-y divide-slate-50">
                                        {d.agente_conversacional.preguntas_frecuentes.map((p: any, i: number) => (
                                            <div key={i} className="flex items-center gap-4 py-3.5">
                                                <span className="text-[11px] font-bold text-white rounded-lg w-6 h-6 flex items-center justify-center flex-shrink-0"
                                                    style={{ background: ["#3b82f6", "#6366f1", "#8b5cf6", "#0ea5e9", "#64748b"][i] }}>
                                                    {i + 1}
                                                </span>
                                                <p className="text-[13px] text-slate-600 flex-1 leading-snug">{p.pregunta}</p>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                                                        <div className="h-full rounded-full" style={{
                                                            width: `${(p.frecuencia / d.agente_conversacional.preguntas_frecuentes[0].frecuencia) * 100}%`,
                                                            background: "linear-gradient(90deg, #3b82f6, #6366f1)"
                                                        }} />
                                                    </div>
                                                    <span className="text-[12px] font-semibold text-slate-400 w-12 text-right">{p.frecuencia}×</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Distribución de consultas */}
                                <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                    <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f4f8" }}>
                                        <p className="text-[13px] font-semibold text-slate-700">Distribución de Consultas</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Éxito vs sin resultados</p>
                                    </div>
                                    <div className="px-4 py-5">
                                        <ResponsiveContainer width="100%" height={180}>
                                            <BarChart data={[
                                                { name: "Exitosas", total: d.agente_conversacional.consultas_exitosas },
                                                { name: "Sin resultados", total: d.agente_conversacional.consultas_sin_resultados },
                                            ]} barSize={48}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f4f8" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.04)" }} />
                                                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                                    <Cell fill="#10b981" />
                                                    <Cell fill="#ef4444" />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

        </div>
    )
}