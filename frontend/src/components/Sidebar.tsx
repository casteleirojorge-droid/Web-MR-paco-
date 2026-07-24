"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const [rolUsuario, setRolUsuario] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const miRol = localStorage.getItem("rol");
    setRolUsuario(miRol);
  }, []);

  const irA = (ruta: string) => {
    router.push(ruta);
    setIsOpen(false);
  };

  const cerrarSesion = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-orange-600 text-white rounded-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white flex flex-col shadow-xl flex-shrink-0 z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      <div className="p-6 text-center border-b border-slate-800 bg-slate-950">
        <h2 className="text-3xl font-black text-orange-500 tracking-tight">MR. PACO</h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Back-Office</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
        <button onClick={() => irA("/dashboard")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Vista General</button>
        
        {/* COMERCIAL - Visible para Admin y Sala */}
        {(rolUsuario === "admin" || rolUsuario === "sala") && (
          <>
            <div className="pt-4 pb-1"><p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Comercial</p></div>
            <button onClick={() => irA("/dashboard/productos")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Gestor de Menú</button>
          </>
        )}

        {/* LOGÍSTICA - Visible para Admin y Logística */}
        {(rolUsuario === "admin" || rolUsuario === "logistica") && (
          <>
            <div className="pt-4 pb-1"><p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Logística / Almacén</p></div>
            <button onClick={() => irA("/dashboard/almacen")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Gestor de Almacén</button>
          </>
        )}

        {/* PRODUCCIÓN - Visible para Admin y Producción */}
        {(rolUsuario === "admin" || rolUsuario === "produccion") && (
          <>
            <div className="pt-4 pb-1"><p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Producción / Cocina</p></div>
            <button onClick={() => irA("/dashboard/produccion")} className="w-full text-left px-4 py-2 text-orange-400 font-bold hover:bg-slate-800 rounded-lg transition-all flex items-center">
              C. Producción
            </button>
          </>
        )}

        {/* CONTABILIDAD - Visible para Admin */}
        {rolUsuario === "admin" && (
          <>
            <div className="pt-4 pb-1"><p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Contabilidad</p></div>
            <button onClick={() => irA("/dashboard/ventas")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Cierre Diario</button>
            <button onClick={() => irA("/dashboard/reportes")} className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-all">Reportes Financieros</button>

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