"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function GestorAlmacen() {
  const [modoCrear, setModoCrear] = useState(false);
  
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [costoFactura, setCostoFactura] = useState("");
  const [tasaCambio, setTasaCambio] = useState(""); // Añadido estado para la tasa
  
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("materia_prima");
  const [nuevaUnidad, setNuevaUnidad] = useState("g");
  const [nuevaMoneda, setNuevaMoneda] = useState("CUP");

  const [inventario, setInventario] = useState<any[]>([]);

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

  const handleCrearProducto = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("🚀 EVENTO DISPARADO: Intentando crear producto...");

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

      if (res.ok) {
        alert("✅ Producto creado con éxito");
        setNuevoNombre("");
        setModoCrear(false);
        cargarInventario();
      } else {
        const err = await res.json();
        alert(`❌ Error: ${err.mensaje}`);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  const handleRegistrarEntrada = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("🚀 Registrando entrada...");
    
    if (!productoSeleccionado || !cantidad || !costoFactura) {
      alert("⚠️ Completa todos los campos principales (Producto, Cantidad y Costo).");
      return;
    }

    const productoCompleto = inventario.find(i => i._id === productoSeleccionado);
    const monedaOriginal = productoCompleto ? productoCompleto.moneda : "CUP";
    const requiereConversion = monedaOriginal !== "CUP";

    if (requiereConversion && !tasaCambio) {
      alert("⚠️ Debes introducir a cómo está el cambio en la calle para procesar esta factura.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://web-mr-paco-production.up.railway.app'}/api/ingredientes/${productoSeleccionado}/stock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          cantidadAgregada: Number(cantidad),
          costoOriginal: Number(costoFactura),
          monedaOriginal: monedaOriginal,
          tasaCambio: requiereConversion ? Number(tasaCambio) : 1
        })
      });

      if (res.ok) {
        alert("✅ Entrada registrada correctamente en contabilidad y almacén.");
        setProductoSeleccionado("");
        setCantidad("");
        setCostoFactura("");
        setTasaCambio("");
        cargarInventario();
      } else {
        const err = await res.json();
        alert(`❌ Error: ${err.mensaje}`);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
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
        cargarInventario();
      } else {
        const err = await res.json();
        alert(`❌ Error: ${err.mensaje}`);
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error de conexión.");
    }
  };

  // Variables para renderizado condicional de moneda
  const productoActual = inventario.find((item: any) => item._id === productoSeleccionado);
  const mostrarTasa = productoActual && productoActual.moneda !== "CUP";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-800">Gestor de Almacén</h1>
          <p className="text-gray-500 mt-2 text-lg">Ingreso de mercancía y recálculo automático de costos (Base CUP).</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 col-span-1 h-fit">
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
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Producto Recibido</label>
                  <select 
                    value={productoSeleccionado} 
                    onChange={(e) => {
                      setProductoSeleccionado(e.target.value);
                      setTasaCambio(""); 
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="">-- Selecciona un producto --</option>
                    {inventario.map((item: any) => (
                      <option key={item._id} value={item._id}>
                        {item.nombre} ({item.unidadMedida}) - Compra en {item.moneda}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad Total</label>
                    <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Ej: 3000" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Costo Factura ({productoActual ? productoActual.moneda : '...'})</label>
                    <input type="number" step="0.01" value={costoFactura} onChange={(e) => setCostoFactura(e.target.value)} placeholder="Ej: 15" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>

                {mostrarTasa && (
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 mt-2">
                    <label className="block text-sm font-black text-orange-800 mb-1">Tasa de Cambio (La calle)</label>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-600">1 {productoActual.moneda} =</span>
                      <input 
                        type="number" 
                        value={tasaCambio} 
                        onChange={(e) => setTasaCambio(e.target.value)} 
                        placeholder="Ej: 320" 
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-bold bg-white" 
                      />
                      <span className="font-bold text-gray-600">CUP</span>
                    </div>
                    {costoFactura && tasaCambio && (
                      <p className="text-xs text-orange-600 mt-2 font-semibold">
                        Gasto real contable: {(Number(costoFactura) * Number(tasaCambio)).toLocaleString()} CUP
                      </p>
                    )}
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={handleRegistrarEntrada}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition mt-4"
                >
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">Moneda de Compra Frecuente</label>
                  <select value={nuevaMoneda} onChange={(e) => setNuevaMoneda(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white">
                    <option value="CUP">CUP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
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

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 col-span-2 overflow-hidden h-fit">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Estado de las Estanterías (Valor en CUP)</h3>
            </div>
            
            {inventario.length === 0 ? (
              <div className="p-8 text-center text-gray-500">El almacén está vacío.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold">Producto</th>
                      <th className="px-6 py-4 font-bold">Costo Promedio Unitario</th>
                      <th className="px-6 py-4 font-bold">Stock Actual</th>
                      <th className="px-6 py-4 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventario.map((item: any) => (
                      <tr key={item._id} className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{item.nombre}</td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                            {Number(item.costoPorUnidad).toFixed(2)} CUP
                          </span> / {item.unidadMedida}
                        </td>
                        <td className="px-6 py-4 font-black text-gray-800 text-lg">
                          {item.stock} <span className="text-sm font-normal text-gray-500">{item.unidadMedida}</span>
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