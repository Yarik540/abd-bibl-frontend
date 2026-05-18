"use client"


import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import N8nPopout from "@/components/N8nPopout"
import {
    LayoutDashboard, Users, FileText, LogOut,
    BookOpen, Search, X, ChevronRight,
    PlusCircle, List, CheckCircle, AlertTriangle, Clock, MessageCircle
} from "lucide-react"

const API = "https://abd-eva-2026-production.up.railway.app"

const MOCK_USUARIOS = [
    {
        idusu: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        email: "admin@lumina.com",
        rol: "administrador",
        created_at: "2025-01-10T08:00:00",
        stats: { total_registros: 0, total_errores: 0, total_consultas_agente: 0, consultas_exitosas: 0 }
    },
    {
        idusu: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        email: "juan.perez@email.com",
        rol: "cliente",
        created_at: "2025-02-15T10:30:00",
        stats: { total_registros: 34, total_errores: 2, total_consultas_agente: 12, consultas_exitosas: 10 }
    },
    {
        idusu: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        email: "maria.lopez@email.com",
        rol: "cliente",
        created_at: "2025-03-01T09:15:00",
        stats: { total_registros: 21, total_errores: 1, total_consultas_agente: 8, consultas_exitosas: 7 }
    },
    {
        idusu: "d4e5f6a7-b8c9-0123-defa-234567890123",
        email: "carlos.gomez@email.com",
        rol: "cliente",
        created_at: "2025-03-20T14:00:00",
        stats: { total_registros: 55, total_errores: 4, total_consultas_agente: 20, consultas_exitosas: 18 }
    },
    {
        idusu: "e5f6a7b8-c9d0-1234-efab-345678901234",
        email: "ana.torres@email.com",
        rol: "cliente",
        created_at: "2025-04-05T11:45:00",
        stats: { total_registros: 18, total_errores: 0, total_consultas_agente: 3, consultas_exitosas: 3 }
    },
]

const MOCK_DETALLE = {
    idusu: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    registros: [
        { titulolibro: "Cien años de soledad", autor: "García Márquez", tipo: "novela", fechareg: "2025-05-10T14:22:00" },
        { titulolibro: "El principito", autor: "Saint-Exupéry", tipo: "cuento", fechareg: "2025-05-09T10:11:00" },
    ],
    logs: [
        { accion: "insertar_registro", estado: "exito", latencia_ms: 210, mensajelog: "Registro insertado", fechalog: "2025-05-10T14:22:00" },
        { accion: "insertar_registro", estado: "error", latencia_ms: 0, mensajelog: "Título vacío", fechalog: "2025-05-09T09:00:00" },
    ],
    consultas: [
        { pregunta: "¿Cuántos registros tengo?", respuesta: "Tienes 34 registros.", exito: true, fecha: "2025-05-08T16:00:00" },
        { pregunta: "¿Libros de García Márquez?", respuesta: "Encontré 3 libros.", exito: true, fecha: "2025-05-07T12:00:00" },
    ],
}

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

export default function UsuariosPage() {
    const router = useRouter()
    const [usuarios, setUsuarios] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [drawer, setDrawer] = useState<any>(null)
    const [drawerLoading, setDrawerLoading] = useState(false)
    const [showN8n, setShowN8n] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        const rol = localStorage.getItem("rol")
        if (!token || rol !== "administrador") { router.push("/"); return }

        const fetchUsuarios = async () => {
            try {
                const res = await fetch(`${API}/api/usuarios`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (!res.ok) throw new Error()
                setUsuarios(await res.json())
            } catch {
                setUsuarios(MOCK_USUARIOS)
            } finally {
                setLoading(false)
            }
        }
        fetchUsuarios()
    }, [])

    const handleVerDetalle = async (idusu: string) => {
        const token = localStorage.getItem("token")
        setDrawerLoading(true)
        setDrawer({ idusu })
        try {
            const res = await fetch(`${API}/api/usuarios/${idusu}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error()
            setDrawer(await res.json())
        } catch {
            setDrawer(MOCK_DETALLE)
        } finally {
            setDrawerLoading(false)
        }
    }

    const filtrados = usuarios.filter(u => {
        const rolVisual =
            u.rol === "cliente" ? "estudiante" : u.rol

        return (
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            rolVisual.toLowerCase().includes(search.toLowerCase())
        )
    })

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin h-10 w-10 rounded-full border-4 border-[#2d5a9b] border-t-transparent" />
                <p className="text-gray-500 text-sm">Cargando usuarios...</p>
            </div>
        </div>
    )

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar active="/admin/usuarios" />
            <main className="flex-1 px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
                    <p className="text-sm text-gray-500">Gestión y estadísticas de usuarios del sistema</p>
                </div>

                {/* Buscador */}
                <div className="relative mb-5 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por email o rol..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2d5a9b]/40 focus:border-[#2d5a9b]"
                    />
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {["Email", "Rol", "Registros", "Errores", "Consultas", "Exitosas", "Creado", "Acciones"].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtrados.map((u) => (
                                <tr key={u.idusu} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-gray-800">{u.email}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.rol === "administrador"
                                            ? "bg-[#2d5a9b]/10 text-[#2d5a9b]"
                                            : "bg-gray-100 text-gray-600"
                                            }`}>
                                            {u.rol === "cliente" ? "estudiante" : u.rol}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-700">{u.stats.total_registros}</td>
                                    <td className="px-5 py-3">
                                        <span className={u.stats.total_errores > 0 ? "text-red-600 font-medium" : "text-gray-700"}>
                                            {u.stats.total_errores}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-700">{u.stats.total_consultas_agente}</td>
                                    <td className="px-5 py-3 text-green-600 font-medium">{u.stats.consultas_exitosas}</td>
                                    <td className="px-5 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString("es-ES")}</td>
                                    <td className="px-5 py-3">
                                        <button onClick={() => handleVerDetalle(u.idusu)}
                                            className="flex items-center gap-1 text-[#2d5a9b] hover:underline text-xs font-medium">
                                            Ver detalle <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtrados.length === 0 && (
                                <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400">No se encontraron usuarios</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Drawer */}
            {drawer && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/30" onClick={() => setDrawer(null)} />
                    <div className="w-[480px] bg-white shadow-2xl flex flex-col overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                            <h2 className="font-bold text-gray-800 text-base">Detalle de Usuario</h2>
                            <button onClick={() => setDrawer(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {drawerLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="animate-spin h-8 w-8 rounded-full border-4 border-[#2d5a9b] border-t-transparent" />
                            </div>
                        ) : (
                            <div className="px-6 py-5 flex flex-col gap-6">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">ID Usuario</p>
                                    <p className="text-sm font-mono text-gray-700">{drawer.idusu}</p>
                                </div>

                                {/* Registros */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Registros</h3>
                                    <table className="w-full text-xs border border-gray-100 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {["Título", "Autor", "Tipo", "Fecha"].map(h => (
                                                    <th key={h} className="px-3 py-2 text-left text-gray-500 font-medium">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(drawer.registros || []).map((r: any, i: number) => (
                                                <tr key={i}>
                                                    <td className="px-3 py-2 text-gray-700">{r.titulolibro}</td>
                                                    <td className="px-3 py-2 text-gray-600">{r.autor}</td>
                                                    <td className="px-3 py-2 text-gray-600">{r.tipo}</td>
                                                    <td className="px-3 py-2 text-gray-500">{new Date(r.fechareg).toLocaleDateString("es-ES")}</td>
                                                </tr>
                                            ))}
                                            {(drawer.registros || []).length === 0 && (
                                                <tr><td colSpan={4} className="px-3 py-3 text-center text-gray-400">Sin registros</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Logs */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Logs recientes</h3>
                                    <table className="w-full text-xs border border-gray-100 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {["Acción", "Estado", "Latencia", "Mensaje"].map(h => (
                                                    <th key={h} className="px-3 py-2 text-left text-gray-500 font-medium">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(drawer.logs || []).map((l: any, i: number) => (
                                                <tr key={i}>
                                                    <td className="px-3 py-2 text-gray-700">{l.accion}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${l.estado === "exito" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                            {l.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-600">{l.latencia_ms}ms</td>
                                                    <td className="px-3 py-2 text-gray-500 truncate max-w-[120px]">{l.mensajelog}</td>
                                                </tr>
                                            ))}
                                            {(drawer.logs || []).length === 0 && (
                                                <tr><td colSpan={4} className="px-3 py-3 text-center text-gray-400">Sin logs</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Consultas agente */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Consultas al Agente</h3>
                                    <table className="w-full text-xs border border-gray-100 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {["Pregunta", "Respuesta", "Éxito"].map(h => (
                                                    <th key={h} className="px-3 py-2 text-left text-gray-500 font-medium">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(drawer.consultas || []).map((c: any, i: number) => (
                                                <tr key={i}>
                                                    <td className="px-3 py-2 text-gray-700 max-w-[140px] truncate">{c.pregunta}</td>
                                                    <td className="px-3 py-2 text-gray-600 max-w-[140px] truncate">{c.respuesta}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${c.exito ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                            {c.exito ? "Sí" : "No"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(drawer.consultas || []).length === 0 && (
                                                <tr><td colSpan={3} className="px-3 py-3 text-center text-gray-400">Sin consultas</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Botón flotante Agente IA */}
            <button
                onClick={() => setShowN8n(v => !v)}
                className="fixed bottom-6 right-6 z-40 bg-[#2d5a9b] hover:bg-[#244a82] text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2 transition-colors"
            >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Agente IA</span>
            </button>

            {/* Popout */}
            <N8nPopout
                onClose={() => setShowN8n(false)}
                visible={showN8n}
            />
        </div>
    )
}
