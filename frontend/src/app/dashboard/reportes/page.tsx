"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function ReportesFinancieros() {
  const [reporte, setReporte] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarReportes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://web-mr-paco-production.up.railway.app'}/api/metricas`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReporte(data);
        }
      } catch (error) {
        console.error("Error al cargar reportes:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarReportes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-800">Reportes Financieros</h1>
          <p className="text-gray-500 mt-2 text-lg">Control de gastos de almacén e inversiones iniciales.</p>
        </header>

        {cargando ? (
          <p className="text-gray-500">Calculando finanzas...</p>
        ) : !reporte ? (
          <p className="text-red-500">Error al obtener los datos financieros.</p>
        ) : (
          <div className="space-y-8">
            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gasto Total (Base CUP)</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {reporte.totalGastosCUP.toLocaleString()} <span className="text-sm font-normal text-gray-500">CUP</span>
                </h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invertido en USD</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-2">
                  ${reporte.desgloseMonedaOriginal.USD.toLocaleString()} <span className="text-sm font-normal text-gray-500">USD</span>
                </h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invertido en EUR</p>
                <h3 className="text-3xl font-black text-blue-600 mt-2">
                  €{reporte.desgloseMonedaOriginal.EUR.toLocaleString()} <span className="text-sm font-normal text-gray-500">EUR</span>
                </h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invertido en CUP nativo</p>
                <h3 className="text-3xl font-black text-orange-600 mt-2">
                  {reporte.desgloseMonedaOriginal.CUP.toLocaleString()} <span className="text-sm font-normal text-gray-500">CUP</span>
                </h3>
              </div>
            </div>

            {/* Tabla de Historial de Compras */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">Historial de Facturas e Ingresos al Almacén</h3>
              </div>
              {reporte.historialCompras.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No hay registros de compras todavía.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-bold">Fecha</th>
                        <th className="px-6 py-4 font-bold">Insumo</th>
                        <th className="px-6 py-4 font-bold">Cantidad</th>
                        <th className="px-6 py-4 font-bold">Costo Original</th>
                        <th className="px-6 py-4 font-bold">Tasa Aplicada</th>
                        <th className="px-6 py-4 font-bold">Total en CUP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reporte.historialCompras.map((compra: any) => (
                        <tr key={compra._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(compra.fechaEntrada).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            {compra.ingrediente ? compra.ingrediente.nombre : "Producto eliminado"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {compra.cantidadComprada}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-700">
                            {compra.costoOriginal} {compra.moneda}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {compra.tasaCambio > 1 ? `${compra.tasaCambio} CUP` : '-'}
                          </td>
                          <td className="px-6 py-4 font-black text-gray-900">
                            {Number(compra.costoTotalCUP).toLocaleString()} CUP
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}