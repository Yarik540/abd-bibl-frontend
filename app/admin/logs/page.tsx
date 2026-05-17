"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    LayoutDashboard, Users, FileText, LogOut,
    BookOpen, CheckCircle, XCircle, AlertTriangle, Activity, ChevronLeft, ChevronRight
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

function Sidebar({ active }: { active: string }) {
    const router = useRouter()

    const handleLogout = async () => {
        const token = localStorage.getItem("token")
        try {
            await fetch(`${API}/api/Auth/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            })
        } catch {
            // si falla igual limpiamos y redirigimos
        } finally {
            localStorage.clear()
            router.push("/")
        }
    }
    const links = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/usuarios", icon: Users, label: "Usuarios" },
        { href: "/admin/logs", icon: FileText, label: "Logs" },
    ]
    return (
        // ← sticky top-0 h-screen para que no se mueva
        <aside className="w-64 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col shadow-sm">
            <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-[#2d5a9b]" />
                    <span className="font-bold text-[#2d5a9b] text-lg">Biblioteca Lumina</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Panel Administrador</p>
            </div>
            <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
                {links.map(({ href, icon: Icon, label }) => (
                    <a key={href} href={href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active === href ? "bg-[#2d5a9b]/10 text-[#2d5a9b] font-medium" : "text-gray-600 hover:bg-gray-100"}`}>
                        <Icon className="h-4 w-4" /> {label}
                    </a>
                ))}
            </nav>
            <div className="px-4 py-4 border-t border-gray-100">
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 text-sm w-full transition-colors">
                    <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
            </div>
        </aside>
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

    const fetchLogs = async (estado: string, accion: string) => {
        const token = localStorage.getItem("token")
        setLoading(true)
        setPagina(1) // reinicia a página 1 al filtrar
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

    // Paginación local
    const totalPaginas = Math.ceil(logs.length / PAGE_SIZE)
    const logsPagina = logs.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar active="/admin/logs" />

            {/* main con scroll propio */}
            <main className="flex-1 overflow-y-auto h-screen px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Logs del Sistema</h1>
                    <p className="text-sm text-gray-500">Historial de operaciones y errores</p>
                </div>

                {/* Tarjetas resumen */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
                        <div className="p-3 rounded-lg bg-[#2d5a9b]">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Logs</p>
                            <p className="text-2xl font-bold text-gray-800">{r.total_logs}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
                        <div className="p-3 rounded-lg bg-green-500">
                            <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Exitosos</p>
                            <p className="text-2xl font-bold text-gray-800">{r.total_exitosos}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
                        <div className="p-3 rounded-lg bg-red-500">
                            <XCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Errores</p>
                            <p className="text-2xl font-bold text-gray-800">{r.total_errores}</p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-3 mb-5">
                    <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2d5a9b]/40">
                        <option value="">Todos los estados</option>
                        <option value="exito">Éxito</option>
                        <option value="error">Error</option>
                        <option value="sin_resultado">Sin resultado</option>
                        <option value="detectado">Detectado</option>
                    </select>
                    <select value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2d5a9b]/40">
                        <option value="">Todas las acciones</option>
                        <option value="busqueda_semantica">busqueda_semantica</option>
                        <option value="generar_embedding">generar_embedding</option>
                        <option value="insertar_registro">insertar_registro</option>
                        <option value="login">login</option>
                        <option value="logout">logout</option>
                        <option value="registro_duplicado">registro_duplicado</option>
                    </select>
                    <button onClick={handleFiltrar}
                        className="px-4 py-2 rounded-lg bg-[#2d5a9b] text-white text-sm font-medium hover:bg-[#244a82] transition-colors">
                        Filtrar
                    </button>
                    <button onClick={() => { setFiltroEstado(""); setFiltroAccion(""); fetchLogs("", "") }}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                        Limpiar
                    </button>
                </div>

                {/* Tabla logs con paginación */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#2d5a9b] border-t-transparent" />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {["Acción", "Estado", "Latencia", "Mensaje", "Usuario", "Fecha"].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logsPagina.map((l: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 text-gray-700 font-medium">{l.accion}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${l.estado === "exito" ? "bg-green-100 text-green-700" : l.estado === "sin_resultado" ? "bg-yellow-100 text-yellow-700" : l.estado === "detectado" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                                                {l.estado}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{l.latencia_ms ?? 0} ms</td>
                                        <td className="px-5 py-3 text-gray-500 max-w-[220px] truncate">{l.mensajelog}</td>
                                        <td className="px-5 py-3 text-gray-500 font-mono text-xs">{l.idusu?.slice(0, 8)}...</td>
                                        <td className="px-5 py-3 text-gray-500">{new Date(l.fechalog).toLocaleString("es-ES")}</td>
                                    </tr>
                                ))}
                                {logsPagina.length === 0 && (
                                    <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No hay logs que mostrar</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* Paginación */}
                        {totalPaginas > 1 && (
                            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    Mostrando {(pagina - 1) * PAGE_SIZE + 1}–{Math.min(pagina * PAGE_SIZE, logs.length)} de {logs.length} logs
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                                        disabled={pagina === 1}
                                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                                        <button key={n} onClick={() => setPagina(n)}
                                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${n === pagina ? "bg-[#2d5a9b] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                                            {n}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                                        disabled={pagina === totalPaginas}
                                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Por acción */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#2d5a9b]" />
                        <h3 className="text-sm font-semibold text-gray-700">Resumen por Acción</h3>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Acción", "Total", "Exitosos", "Errores", "Latencia Promedio"].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(r.por_accion ?? []).map((a: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-gray-700 font-medium">{a.accion}</td>
                                    <td className="px-6 py-3 text-gray-600">{a.total}</td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{a.exitosos}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">{a.errores}</span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-600">{a.latencia_promedio_ms} ms</td>
                                </tr>
                            ))}
                            {(r.por_accion ?? []).length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-400">Sin datos</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Errores por usuario */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <h3 className="text-sm font-semibold text-gray-700">Errores por Usuario</h3>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario (ID)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Errores</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(r.errores_por_usuario ?? []).map((e: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-gray-700 font-mono text-xs">{e.idusu}</td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">{e.total_errores}</span>
                                    </td>
                                </tr>
                            ))}
                            {(r.errores_por_usuario ?? []).length === 0 && (
                                <tr><td colSpan={2} className="px-6 py-6 text-center text-gray-400">Sin errores registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}