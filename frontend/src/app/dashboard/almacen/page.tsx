"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function GestorAlmacen() {
  const [modoCrear, setModoCrear] = useState(false);
  
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [costoFactura, setCostoFactura] = useState("");
  
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("materia_prima");
  const [nuevaUnidad, setNuevaUnidad] = useState("g");
  const [nuevaMoneda, setNuevaMoneda] = useState("CUP");

  const [inventario, setInventario] = useState([]);

  const cargarInventario = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://web-mr-paco-production.up.railway.app'}/api/ingredientes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInventario(data);
      }
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  // Pasado a React.MouseEvent al estar vinculado directamente al botón
  const handleCrearProducto = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("🚀 EVENTO DISPARADO: Intentando crear producto...");
    console.log("Payload:", { nombre: nuevoNombre, categoria: nuevaCategoria, unidadMedida: nuevaUnidad, moneda: nuevaMoneda });

    if (!nuevoNombre) {
      alert("Debes escribir un nombre para el producto.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://web-mr-paco-production.up.railway.app'}/api/ingredientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nuevoNombre,
          categoria: nuevaCategoria,
          unidadMedida: nuevaUnidad,
          moneda: nuevaMoneda,
          costoPorUnidad: 0,
          stock: 0
        })
      });

      console.log("Respuesta del servidor (Status):", res.status);

      if (res.ok) {
        alert("✅ Producto creado con éxito");
        setNuevoNombre("");
        setModoCrear(false);
        cargarInventario();
      } else {
        const err = await res.json();
        alert(`❌ Error: ${err.mensaje}`);
        console.error("Detalle del error:", err);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  const handleRegistrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registrar entrada...");
    // Lógica pendiente para sumar stock
  };

  const handleEliminarProducto = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombre}" del catálogo? Esta acción no se puede deshacer.`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://web-mr-paco-production.up.railway.app'}/api/ingredientes/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        cargarInventario(); // Recarga la tabla
      } else {
        const err = await res.json();
        alert(`❌ Error: ${err.mensaje}`);
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error de conexión.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-800">Gestor de Almacén</h1>
          <p className="text-gray-500 mt-2 text-lg">Ingreso de mercancía y recálculo automático de costos.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 col-span-1">
            <div className="flex border-b border-gray-200 mb-6">
              <button 
                type="button"
                onClick={() => setModoCrear(false)}
                className={`pb-2 flex-1 text-sm font-semibold transition-colors ${!modoCrear ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                📥 Ingresar Stock
              </button>
              <button 
                type="button"
                onClick={() => setModoCrear(true)}
                className={`pb-2 flex-1 text-sm font-semibold transition-colors ${modoCrear ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ➕ Crear Nuevo
              </button>
            </div>

            {!modoCrear ? (
              <form onSubmit={handleRegistrarEntrada} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Producto Recibido</label>
                  <select 
                    value={productoSeleccionado} 
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Selecciona un producto --</option>
                    {inventario.map((item: any) => (
                      <option key={item._id} value={item._id}>{item.nombre} ({item.unidadMedida}) - {item.moneda}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad</label>
                    <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Ej: 3000" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Costo Total</label>
                    <input type="number" value={costoFactura} onChange={(e) => setCostoFactura(e.target.value)} placeholder="Ej: 15000" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition mt-4">
                  Confirmar al Almacén
                </button>
              </form>
            ) : (
              <div className="space-y-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Producto</label>
                  <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej: Tomate Pera" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                    <select value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white">
                      <option value="materia_prima">Materia Prima</option>
                      <option value="pre_elaborado">Pre-elaborado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Unidad</label>
                    <select value={nuevaUnidad} onChange={(e) => setNuevaUnidad(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white">
                      <option value="ud">Unidades (ud)</option>
                      <option value="g">Gramos (g)</option>
                      <option value="ml">Mililitros (ml)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Moneda de Compra</label>
                  <select value={nuevaMoneda} onChange={(e) => setNuevaMoneda(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white">
                    <option value="CUP">CUP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <button 
                  type="button" 
                  onClick={handleCrearProducto} 
                  className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 transition mt-4"
                >
                  Guardar en Catálogo
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 col-span-2 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Estado de las Estanterías</h3>
            </div>
            
            {inventario.length === 0 ? (
              <div className="p-8 text-center text-gray-500">El almacén está vacío.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold">Producto</th>
                      <th className="px-6 py-4 font-bold">Costo Unitario</th>
                      <th className="px-6 py-4 font-bold">Stock Actual</th>
                      <th className="px-6 py-4 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventario.map((item: any) => (
                      <tr key={item._id} className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{item.nombre}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {Number(item.costoPorUnidad).toFixed(2)} {item.moneda} / {item.unidadMedida}
                        </td>
                        <td className="px-6 py-4 font-black text-gray-800">
                          {item.stock} {item.unidadMedida}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleEliminarProducto(item._id, item.nombre)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}