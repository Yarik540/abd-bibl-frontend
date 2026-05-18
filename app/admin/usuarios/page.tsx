"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import N8nPopout from "@/components/N8nPopout"
import {
    LayoutDashboard, Users, FileText, LogOut,
    BookOpen, Search, X, ChevronRight,
    MessageCircle, CheckCircle, AlertTriangle
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
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
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
                            <Icon className="h-4 w-4 flex-shrink-0"
                                style={{ color: isActive ? "#60a5fa" : "rgba(148,163,184,0.6)" }} />
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
        const rolVisual = u.rol === "cliente" ? "estudiante" : u.rol
        return (
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            rolVisual.toLowerCase().includes(search.toLowerCase())
        )
    })

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center" style={{ background: "#f4f6f9" }}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Cargando usuarios...</p>
            </div>
        </div>
    )

    return (
        <div className="flex min-h-screen" style={{ background: "#f4f6f9", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
            <Sidebar active="/admin/usuarios" />

            <main className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between"
                    style={{ background: "rgba(244,246,249,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div>
                        <h1 className="text-[18px] font-bold text-slate-800 leading-tight">Usuarios</h1>
                        <p className="text-[12px] text-slate-400">Gestión y estadísticas de usuarios del sistema</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-slate-500"
                        style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Sistema activo
                    </div>
                </header>

                <div className="flex-1 px-8 py-6">
                    {/* Buscador */}
                    <div className="relative mb-5 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por email o rol..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] text-slate-700 focus:outline-none transition-all"
                            style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                            onFocus={e => (e.currentTarget.style.border = "1px solid #93c5fd")}
                            onBlur={e => (e.currentTarget.style.border = "1px solid #e2e8f0")}
                        />
                    </div>

                    {/* Tabla */}
                    <div className="rounded-xl overflow-hidden"
                        style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f4f8" }}>
                            <div>
                                <p className="text-[13px] font-semibold text-slate-700">Lista de usuarios</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{filtrados.length} usuarios encontrados</p>
                            </div>
                            <Users className="h-4 w-4 text-slate-300" />
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    {["Email", "Rol", "Registros", "Errores", "Consultas", "Exitosas", "Creado", "Acciones"].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.map((u) => (
                                    <tr key={u.idusu} style={{ borderTop: "1px solid #f1f4f8" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                        <td className="px-5 py-3.5">
                                            <span className="text-[13px] font-semibold text-slate-700">{u.email}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                                style={u.rol === "administrador"
                                                    ? { background: "rgba(59,130,246,0.1)", color: "#1d4ed8" }
                                                    : { background: "#f1f5f9", color: "#475569" }}>
                                                {u.rol === "cliente" ? "estudiante" : u.rol}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-[13px] text-slate-600">{u.stats.total_registros}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {u.stats.total_errores > 0
                                                ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                                    style={{ background: "#fef2f2", color: "#dc2626" }}>{u.stats.total_errores}</span>
                                                : <span className="text-[13px] text-slate-400">—</span>
                                            }
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-[13px] text-slate-600">{u.stats.total_consultas_agente}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                                style={{ background: "#f0fdf4", color: "#16a34a" }}>{u.stats.consultas_exitosas}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-[12px] text-slate-400">{new Date(u.created_at).toLocaleDateString("es-ES")}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <button onClick={() => handleVerDetalle(u.idusu)}
                                                className="flex items-center gap-1 text-[12px] font-semibold transition-all"
                                                style={{ color: "#3b82f6" }}
                                                onMouseEnter={e => (e.currentTarget.style.color = "#1d4ed8")}
                                                onMouseLeave={e => (e.currentTarget.style.color = "#3b82f6")}>
                                                Ver detalle <ChevronRight className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filtrados.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-10 text-center text-[13px] text-slate-400">
                                            No se encontraron usuarios
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Drawer */}
            {drawer && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setDrawer(null)} />
                    <div className="w-[500px] flex flex-col overflow-y-auto"
                        style={{ background: "#f4f6f9", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}>

                        {/* Drawer header */}
                        <div className="px-6 py-5 flex items-center justify-between sticky top-0 z-10"
                            style={{ background: "rgba(244,246,249,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <div>
                                <h2 className="text-[15px] font-bold text-slate-800">Detalle de Usuario</h2>
                                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{drawer.idusu?.slice(0, 20)}…</p>
                            </div>
                            <button onClick={() => setDrawer(null)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                style={{ color: "#64748b", background: "#fff", border: "1px solid #e2e8f0" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {drawerLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="relative w-10 h-10">
                                    <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                                </div>
                            </div>
                        ) : (
                            <div className="px-6 py-5 flex flex-col gap-4">

                                {/* Registros */}
                                <div className="rounded-xl overflow-hidden"
                                    style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                    <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: "1px solid #f1f4f8" }}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                        <p className="text-[12px] font-semibold text-slate-700">Registros</p>
                                    </div>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr style={{ background: "#f8fafc" }}>
                                                {["Título", "Autor", "Tipo", "Fecha"].map(h => (
                                                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(drawer.registros || []).map((r: any, i: number) => (
                                                <tr key={i} style={{ borderTop: "1px solid #f1f4f8" }}>
                                                    <td className="px-4 py-2.5 text-[12px] font-semibold text-slate-700">{r.titulolibro}</td>
                                                    <td className="px-4 py-2.5 text-[12px] text-slate-500">{r.autor}</td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                            style={{ background: "#eff6ff", color: "#2563eb" }}>{r.tipo}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-[11px] text-slate-400">{new Date(r.fechareg).toLocaleDateString("es-ES")}</td>
                                                </tr>
                                            ))}
                                            {(drawer.registros || []).length === 0 && (
                                                <tr><td colSpan={4} className="px-4 py-5 text-center text-[12px] text-slate-400">Sin registros</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Logs */}
                                <div className="rounded-xl overflow-hidden"
                                    style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                    <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: "1px solid #f1f4f8" }}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <p className="text-[12px] font-semibold text-slate-700">Logs recientes</p>
                                    </div>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr style={{ background: "#f8fafc" }}>
                                                {["Acción", "Estado", "Latencia", "Mensaje"].map(h => (
                                                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(drawer.logs || []).map((l: any, i: number) => (
                                                <tr key={i} style={{ borderTop: "1px solid #f1f4f8" }}>
                                                    <td className="px-4 py-2.5 text-[12px] font-semibold text-slate-700">{l.accion}</td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                            style={l.estado === "exito"
                                                                ? { background: "#f0fdf4", color: "#16a34a" }
                                                                : { background: "#fef2f2", color: "#dc2626" }}>
                                                            {l.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-[12px] text-slate-500">{l.latencia_ms} ms</td>
                                                    <td className="px-4 py-2.5 text-[12px] text-slate-400 truncate max-w-[120px]">{l.mensajelog}</td>
                                                </tr>
                                            ))}
                                            {(drawer.logs || []).length === 0 && (
                                                <tr><td colSpan={4} className="px-4 py-5 text-center text-[12px] text-slate-400">Sin logs</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Consultas agente */}
                                <div className="rounded-xl overflow-hidden"
                                    style={{ background: "#fff", border: "1px solid #e8ecf0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                    <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: "1px solid #f1f4f8" }}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                        <p className="text-[12px] font-semibold text-slate-700">Consultas al Agente</p>
                                    </div>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr style={{ background: "#f8fafc" }}>
                                                {["Pregunta", "Respuesta", "Éxito"].map(h => (
                                                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(drawer.consultas || []).map((c: any, i: number) => (
                                                <tr key={i} style={{ borderTop: "1px solid #f1f4f8" }}>
                                                    <td className="px-4 py-2.5 text-[12px] text-slate-700 max-w-[140px] truncate">{c.pregunta}</td>
                                                    <td className="px-4 py-2.5 text-[12px] text-slate-500 max-w-[140px] truncate">{c.respuesta}</td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                            style={c.exito
                                                                ? { background: "#f0fdf4", color: "#16a34a" }
                                                                : { background: "#fef2f2", color: "#dc2626" }}>
                                                            {c.exito ? "Sí" : "No"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(drawer.consultas || []).length === 0 && (
                                                <tr><td colSpan={3} className="px-4 py-5 text-center text-[12px] text-slate-400">Sin consultas</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}