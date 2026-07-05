"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // Importamos tu nueva barra lateral inteligente

export default function GestorAlmacen() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarIngredientes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const respuesta = await fetch("http://localhost:4000/api/ingredientes", {
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store"
      });

      if (respuesta.ok) {
        setIngredientes(await respuesta.json());
      }
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarIngredientes();
  }, [router]);

  const registrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(`http://localhost:4000/api/ingredientes/${ingredienteSeleccionado}/stock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cantidadAgregada: Number(cantidad) })
      });

      if (respuesta.ok) {
        alert("✅ Entrada de mercancía registrada con éxito.");
        setIngredienteSeleccionado("");
        setCantidad("");
        cargarIngredientes(); // Recargar el stock actual de las estanterías
      } else {
        const error = await respuesta.json();
        alert(`Error: ${error.mensaje}`);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="p-8 font-bold text-orange-600">Cargando estanterías del almacén...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* BARRA LATERAL (El componente universal) */}
      <Sidebar />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestor de Almacén</h1>
          <p className="text-gray-500 mt-1">Control de stock e ingreso de mercancía de proveedores.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario de Entrada */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-orange-100 p-2 rounded-lg mr-3">📦</span>
                Registrar Entrada
              </h2>

              <form onSubmit={registrarEntrada} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ingrediente Recibido</label>
                  <select
                    value={ingredienteSeleccionado}
                    onChange={(e) => setIngredienteSeleccionado(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50 text-black font-medium"
                  >
                    <option value="">-- Selecciona un producto --</option>
                    {ingredientes.map((ing) => (
                      <option key={ing._id} value={ing._id}>
                        {ing.nombre} (Mide en: {ing.unidadMedida})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad a Sumar</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej: 3000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={guardando || !ingredienteSeleccionado}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Confirmar Recepción"}
                </button>
              </form>
            </div>
          </div>

          {/* Estado Actual de las Estanterías */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Estado Actual de las Estanterías</h3>
                <span className="text-sm font-bold text-gray-500">Total: {ingredientes.length} items</span>
              </div>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Producto</th>
                    <th className="p-4 font-bold">Unidad</th>
                    <th className="p-4 font-bold text-right">Stock Actual</th>
                    <th className="p-4 font-bold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ingredientes.map(ing => (
                    <tr key={ing._id} className="hover:bg-orange-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{ing.nombre}</td>
                      <td className="p-4 text-sm font-medium text-gray-600">{ing.unidadMedida}</td>
                      <td className={`p-4 text-right font-black text-lg ${ing.stock < 0 ? 'text-red-500' : (ing.stock < 1000 ? 'text-yellow-500' : 'text-green-600')}`}>
                        {ing.stock}
                      </td>
                      <td className="p-4 text-center">
                        {ing.stock <= 0 ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Roto de Stock</span>
                        ) : ing.stock < 1000 ? (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Poco Stock</span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Óptimo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {ingredientes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-400 font-medium">No hay materias primas registradas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}