"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const [rolUsuario, setRolUsuario] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Al cargar, leemos quién es el usuario
    const miRol = localStorage.getItem("rol");
    setRolUsuario(miRol);
  }, []);

  const irA = (ruta: string) => {
    router.push(ruta);
    setIsOpen(false); // Cerrar sidebar al navegar en móvil
  };

  const cerrarSesion = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-orange-600 text-white rounded-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white flex flex-col shadow-xl flex-shrink-0 z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      <div className="p-6 text-center border-b border-slate-800 bg-slate-950">
        <h2 className="text-3xl font-black text-orange-500 tracking-tight">MR. PACO</h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Back-Office</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
        <button onClick={() => irA("/dashboard")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Vista General</button>
        
        <div className="pt-4 pb-1"><p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Comercial</p></div>
        <button onClick={() => irA("/dashboard/productos")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Gestor de Menú</button>

        <div className="pt-4 pb-1"><p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Logística / Almacén</p></div>
        <button onClick={() => irA("/dashboard/ingredientes")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Materias Primas</button>
        <button onClick={() => irA("/dashboard/almacen")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Inventario</button>

        {/* NUEVO BOTÓN */}
        <button onClick={() => irA("/dashboard/produccion")} className="w-full text-left px-4 py-2 text-orange-400 font-bold hover:bg-slate-800 rounded-lg transition-all flex items-center">
          C. Producción
        </button>

        <div className="pt-4 pb-1"><p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Contabilidad</p></div>
        <button onClick={() => irA("/dashboard/ventas")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Cierre Diario</button>
        <button onClick={() => irA("/dashboard/reportes")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Reportes Financieros</button>

        {rolUsuario === "admin" && (
          <>
            <div className="pt-4 pb-1"><p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">RRHH & Admin</p></div>
            <button onClick={() => irA("/dashboard/empleados")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Personal</button>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button onClick={cerrarSesion} className="w-full px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-xl transition-colors">
          Cerrar Sesión
        </button>
      </div>
    </aside>
    </>
  );
}