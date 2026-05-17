"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    LayoutDashboard, Users, FileText, LogOut,
    BookOpen, AlertTriangle, CheckCircle, MessageSquare,
    Clock, Database, TrendingUp, XCircle, Zap
} from "lucide-react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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
            { idusu: "usr-001", total: 34 },
            { idusu: "usr-002", total: 21 },
            { idusu: "usr-003", total: 18 },
            { idusu: "usr-004", total: 55 },
        ],
        ultimos_registros: [
            { titulolibro: "Cien años de soledad", autor: "García Márquez", tipo: "novela", fechareg: "2025-05-10T14:22:00" },
            { titulolibro: "El principito", autor: "Saint-Exupéry", tipo: "cuento", fechareg: "2025-05-09T10:11:00" },
            { titulolibro: "1984", autor: "Orwell", tipo: "distopía", fechareg: "2025-05-08T08:45:00" },
            { titulolibro: "Don Quijote", autor: "Cervantes", tipo: "novela", fechareg: "2025-05-07T16:30:00" },
            { titulolibro: "La Odisea", autor: "Homero", tipo: "épica", fechareg: "2025-05-06T09:00:00" },
        ],
    },
    calidad_datos: {
        registros_incompletos: 5,
        registros_duplicados_o_similares: 9,
        nivel_promedio_similitud: 0.92,
        registros_rechazados: 5,
        ultimos_errores: [
            { accion: "insertar_registro", estado: "error", mensajelog: "Título vacío", fechalog: "2025-05-10T13:00:00" },
            { accion: "busqueda_semantica", estado: "error", mensajelog: "Texto vacío", fechalog: "2025-05-09T11:30:00" },
        ],
    },
}

function Sidebar() {
    const router = useRouter()

    const handleLogout = async () => {
        const token = localStorage.getItem("token")
        try {
            await fetch(`${API}/api/Auth/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            })
        } catch {
            
        } finally {
            localStorage.clear()
            router.push("/")
        }
    }
    return (
        <aside className="w-64 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col shadow-sm">
            <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-[#2d5a9b]" />
                    <span className="font-bold text-[#2d5a9b] text-lg">Biblioteca Lumina</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Panel Administrador</p>
            </div>
            <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
                <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#2d5a9b]/10 text-[#2d5a9b] font-medium text-sm">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                </a>
                <a href="/admin/usuarios" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm transition-colors">
                    <Users className="h-4 w-4" /> Usuarios
                </a>
                <a href="/admin/logs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm transition-colors">
                    <FileText className="h-4 w-4" /> Logs
                </a>
            </nav>
            <div className="px-4 py-4 border-t border-gray-100">
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 text-sm w-full transition-colors">
                    <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
            </div>
        </aside>
    )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    )
}

const TABS = ["Resumen General", "Rendimiento Vectorial", "Actividad de Usuarios", "Calidad de Datos"]

export default function DashboardPage() {
    const router = useRouter()
    const [tab, setTab] = useState(0)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const token = localStorage.getItem("token")
        const rol = localStorage.getItem("rol")
        if (!token || rol !== "administrador") { router.push("/"); return }

        const fetchData = async () => {
            try {
                const res = await fetch(`${API}/api/Dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.status === 401 || res.status === 403) { router.push("/"); return }
                if (!res.ok) throw new Error("Error al cargar datos")
                const json = await res.json()
                setData(json)
            } catch {
                setData(MOCK) // usar mock si falla
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin h-10 w-10 rounded-full border-4 border-[#2d5a9b] border-t-transparent" />
                <p className="text-gray-500 text-sm">Cargando dashboard...</p>
            </div>
        </div>
    )

    const d = data || MOCK

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-sm text-gray-500">Métricas generales del sistema</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    {TABS.map((t, i) => (
                        <button key={i} onClick={() => setTab(i)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === i ? "border-[#2d5a9b] text-[#2d5a9b]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Tab 1: Resumen */}
                {tab === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard icon={BookOpen} label="Total Registros" value={d.resumen.total_registros} color="bg-[#2d5a9b]" />
                        <StatCard icon={Users} label="Total Usuarios" value={d.resumen.total_usuarios} color="bg-blue-500" />
                        <StatCard icon={AlertTriangle} label="Total Errores" value={d.resumen.total_errores} color="bg-red-500" />
                        <StatCard icon={TrendingUp} label="Tasa de Éxito (%)" value={`${d.resumen.tasa_exito}%`} color="bg-green-500" />
                        <StatCard icon={MessageSquare} label="Consultas al Agente" value={d.resumen.total_consultas_agente} color="bg-violet-500" />
                    </div>
                )}

                {/* Tab 2: Rendimiento Vectorial */}
                {tab === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={Clock}
                            label="Latencia Promedio Inserción (ms)"
                            value={`${d.rendimiento_vectorial.latencia_promedio_ms} ms`}
                            color="bg-amber-500"
                        />
                        <StatCard
                            icon={Zap}
                            label="Tiempo Consulta Semántica (ms)"
                            value={`${d.rendimiento_vectorial.tiempo_promedio_consulta_semantica_ms} ms`}
                            color="bg-[#2d5a9b]"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Tiempo Generación Embeddings (ms)"
                            value={`${d.rendimiento_vectorial.tiempo_promedio_generacion_embeddings_ms} ms`}
                            color="bg-green-500"
                        />
                        <StatCard
                            icon={Database}
                            label="Vectores Almacenados"
                            value={d.rendimiento_vectorial.total_vectores_almacenados}
                            color="bg-violet-500"
                        />
                    </div>
                )}

                {/* Tab 3: Actividad de Usuarios */}
                {tab === 2 && (
                    <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Registros por Usuario</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={d.actividad_usuarios.registros_por_usuario.map((r: any) => ({ ...r, idusu: r.idusu.slice(0, 8) + "..." }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="idusu" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#2d5a9b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700">Últimos 5 Registros</h3>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["Título", "Autor", "Tipo", "Fecha"].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {d.actividad_usuarios.ultimos_registros.map((r: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium text-gray-800">{r.titulolibro}</td>
                                            <td className="px-6 py-3 text-gray-600">{r.autor}</td>
                                            <td className="px-6 py-3">
                                                <span className="px-2 py-1 rounded-full text-xs bg-[#2d5a9b]/10 text-[#2d5a9b] font-medium">{r.tipo}</span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-500">{new Date(r.fechareg).toLocaleDateString("es-ES")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 3 && (
                    <div className="space-y-6">
                        {/* Métricas principales */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon={AlertTriangle}
                                label="Registros Incompletos"
                                value={d.calidad_datos.registros_incompletos}
                                color="bg-yellow-500"
                            />
                            <StatCard
                                icon={XCircle}
                                label="Duplicados o Similares"
                                value={d.calidad_datos.registros_duplicados_o_similares}
                                color="bg-red-500"
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="Nivel Promedio Similitud"
                                value={d.calidad_datos.nivel_promedio_similitud}
                                color="bg-green-500"
                            />
                            <StatCard
                                icon={Zap}
                                label="Registros Rechazados"
                                value={d.calidad_datos.registros_rechazados}
                                color="bg-purple-500"
                            />
                        </div>

                        {/* Tabla de últimos errores */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700">Últimos Errores</h3>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["Acción", "Estado", "Mensaje", "Fecha"].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {d.calidad_datos.ultimos_errores.map((e: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-gray-700">{e.accion}</td>
                                            <td className="px-6 py-3">
                                                <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700 font-medium">{e.estado}</span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600">{e.mensajelog}</td>
                                            <td className="px-6 py-3 text-gray-500">
                                                {new Date(e.fechalog).toLocaleDateString("es-ES")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}
