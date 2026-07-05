"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const respuesta = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        localStorage.setItem("token", datos.token);
        localStorage.setItem("rol", datos.rol);
        
        // Más adelante programaremos que si es 'cliente' vaya al menú, y si es 'admin' al dashboard
        router.push("/dashboard"); 
      } else {
        setError(datos.mensaje || "Correo o contraseña incorrectos");
      }
    } catch (err) {
      setError("Ups, tenemos un problema de conexión. Inténtalo en unos minutos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-50">
      {/* Columna Izquierda: Branding Comercial de Mr. Paco */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5 mix-blend-overlay"></div> 
        
        <div className="z-10 text-center text-white p-12 flex flex-col items-center">
          <div className="mb-6">
            <div className="relative w-80 h-80 drop-shadow-2xl hover:scale-105 transition-transform duration-500">
              <Image 
                src="/logo-cafeteria.jpg" 
                alt="Bienvenido a Mr. Paco"
                fill
                sizes="(max-width: 768px) 100vw, 33vw" // ¡Añade esta línea!
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h2 className="text-5xl font-black mb-3 tracking-tight drop-shadow-md">
            ¡Qué bueno verte!
          </h2>
          <p className="text-xl text-white/95 max-w-sm mx-auto font-medium drop-shadow-sm">
            Tus platos favoritos y los mejores productos, a un solo clic de distancia.
          </p>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Login Amigable */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="lg:hidden text-4xl font-black text-orange-600 mb-2 tracking-tight">
              MR. PACO
            </h1>
            <h2 className="text-3xl font-bold text-gray-900">
              Accede a tu cuenta
            </h2>
            <p className="mt-2 text-base text-gray-500 font-medium">
              Inicia sesión para realizar tu pedido o gestionar tu perfil
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-md animate-pulse">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-bold">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 mb-4">
              <div className="text-sm">
                <a href="#" className="font-bold text-orange-600 hover:text-orange-500 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg transform transition-all hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? "Cargando..." : "Entrar"}
              </button>
            </div>
            
            {/* Opción de registro para clientes nuevos */}
            <p className="text-center text-sm text-gray-600 mt-6 font-medium">
              ¿Aún no tienes cuenta?{" "}
              <a href="#" className="font-bold text-red-600 hover:text-red-500 transition-colors">
                Regístrate aquí
              </a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}