import { Navbar } from "@/components/navbar"
import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/library-bg.jpg')",
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Centered content */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 pt-16 pb-12">
          {/* Title */}
          <h1 className="mb-8 text-4xl font-extrabold tracking-wide text-white drop-shadow-lg md:text-5xl lg:text-[3.25rem] text-balance text-center">
            BIBLIOTECA LUMINA
          </h1>

          {/* Login form */}
          <LoginForm />
        </div>

      </div>
    </main>
  )
}
