"use client"

import Link from "next/link"

export function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 flex items-center gap-8 px-8 py-5">
      <Link href="/" className="flex flex-col leading-tight">
        <span className="text-xl font-bold tracking-widest text-white">LUMINA</span>
        <span className="text-[0.65rem] font-semibold tracking-[0.35em] text-white/90">BIBLIOTECA</span>
      </Link>
      <div className="flex items-center gap-6 ml-4">
        <Link
          href="#"
          className="text-sm font-medium text-white/90 underline underline-offset-4 decoration-white/60 hover:text-white transition-colors"
        >
          {"Catálogo"}
        </Link>
        <Link
          href="#"
          className="text-sm font-medium text-white/90 underline underline-offset-4 decoration-white/60 hover:text-white transition-colors"
        >
          Eventos
        </Link>
        <Link
          href="#"
          className="text-sm font-medium text-white/90 underline underline-offset-4 decoration-white/60 hover:text-white transition-colors"
        >
          Contacto
        </Link>
      </div>
    </nav>
  )
}
