"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // Importamos tu nueva barra lateral inteligente

interface Cierre {
  _id: string;
  totalRecaudado: number;
  costoTotal?: number; // Opcional, porque los cierres viejos no lo tienen
  fecha: string;
}

export default function ReportesFinancieros() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [historial, setHistorial] = useState<Cierre[]>([]);
  const [rolUsuario, setRolUsuario] = useState<string | null>(null);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const token = localStorage.getItem("token");
        const miRol = localStorage.getItem("rol");
        setRolUsuario(miRol);

        if (!token) return router.push("/login");

        const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pedidos/historial`, {
          headers: { "Authorization": `Bearer ${token}` },
          cache: "no-store"
        });

        if (respuesta.ok) {
          setHistorial(await respuesta.json());
        }
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, [router]);

  // SUPER CÁLCULOS CONTABLES GLOBALES
  const totalBruto = historial.reduce((acc, cierre) => acc + cierre.totalRecaudado, 0);
  const totalCostos = historial.reduce((acc, cierre) => acc + (cierre.costoTotal || 0), 0);
  const beneficioNeto = totalBruto - totalCostos;
  
  // Protegemos el cálculo del margen para que no divida entre cero si no hay ventas
  const margenPorcentaje = totalBruto > 0 ? (beneficioNeto / totalBruto) * 100 : 0;

  const irA = (ruta: string) => router.push(ruta);

  if (cargando) return <div className="p-8 font-bold text-green-600">Cargando libros contables...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* BARRA LATERAL REESTRUCTURADA */}
      <Sidebar />

      {/* CONTENIDO DE CONTABILIDAD */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-800">Reportes Financieros</h1>
          <p className="text-gray-500 mt-2 text-lg">Auditoría de ingresos, gastos y beneficios reales.</p>
        </header>

        {/* KPIs FINANCIEROS (NIVEL PRO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ingreso Bruto</h3>
            <p className="text-3xl font-black text-gray-800 mt-2">{totalBruto.toFixed(2)} $</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 bg-red-50/30">
            <h3 className="text-red-800 text-xs font-bold uppercase tracking-wider">Costo Materia Prima</h3>
            <p className="text-3xl font-black text-red-600 mt-2">-{totalCostos.toFixed(2)} $</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 bg-green-50/50">
            <h3 className="text-green-800 text-xs font-bold uppercase tracking-wider">Beneficio Neto</h3>
            <p className="text-3xl font-black text-green-600 mt-2">{beneficioNeto.toFixed(2)} $</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Margen Operativo</h3>
            <p className="text-3xl font-black text-white mt-2">{margenPorcentaje.toFixed(1)} %</p>
          </div>
        </div>

        {/* TABLA DE AUDITORÍA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Desglose por Cierres Diarios</h2>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Fecha</th>
                <th className="p-4 font-bold text-right">Ingreso Bruto</th>
                <th className="p-4 font-bold text-right">Costos (Escandallos)</th>
                <th className="p-4 font-bold text-right">Beneficio Real</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historial.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">No hay registros financieros todavía.</td>
                </tr>
              ) : (
                historial.map((cierre) => {
                  const fechaObj = new Date(cierre.fecha);
                  const costo = cierre.costoTotal || 0;
                  const neto = cierre.totalRecaudado - costo;
                  
                  return (
                    <tr key={cierre._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-900 text-sm">
                          {fechaObj.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">{fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="p-4 text-right font-bold text-gray-800">
                        {cierre.totalRecaudado.toFixed(2)} $
                      </td>
                      <td className="p-4 text-right font-medium text-red-500">
                        -{costo.toFixed(2)} $
                      </td>
                      <td className="p-4 text-right font-black text-green-600 text-lg">
                        {neto.toFixed(2)} $
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}