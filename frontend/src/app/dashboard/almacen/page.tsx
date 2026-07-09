"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function GestorAlmacen() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  
  // Estados del formulario
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [costoTotal, setCostoTotal] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Encontrar el objeto completo para saber en qué moneda se paga y su unidad de medida
  const ingObj = ingredientes.find(ing => ing._id === ingredienteSeleccionado);

  const cargarIngredientes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingredientes`, {
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
    if (!ingObj) return alert("Selecciona un ingrediente válido.");
    
    setGuardando(true);

    try {
      const token = localStorage.getItem("token");
      
      // Creamos el paquete para el nuevo motor de entradas (Costo Promedio Ponderado)
      const albaran = {
        ingredienteId: ingredienteSeleccionado,
        cantidadComprada: Number(cantidad),
        costoTotal: Number(costoTotal),
        moneda: ingObj.moneda,
        proveedor: proveedor || "Sin especificar"
      };

      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/entradas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(albaran)
      });

      if (respuesta.ok) {
        const data = await respuesta.json();
        alert(`¡Entrada registrada!\n\nNuevo Stock: ${data.nuevoStock} ${ingObj.unidadMedida}\nNuevo Costo Promedio: ${data.nuevoCosto} ${ingObj.moneda}`);
        
        // Limpiamos el formulario
        setIngredienteSeleccionado("");
        setCantidad("");
        setCostoTotal("");
        setProveedor("");
        cargarIngredientes(); // Recargamos para ver los cambios en la tabla
      } else {
        const error = await respuesta.json();
        alert(`Error: ${error.mensaje}`);
      }
    } catch (error) {
      alert("Error de conexión.");
    } finally {
      setGuardando(false);
    }
  };

  // ASISTENTE DE LOGÍSTICA: Filtrar insumos críticos (Mantengo tu genial idea)
  const insumosCriticos = ingredientes.filter(ing => ing.stock < 1000);

  const copiarListaCompra = () => {
    if (insumosCriticos.length === 0) return alert("El inventario está óptimo. No se requieren compras.");
    
    let textoPedido = `📋 REQUERIMIENTO DE SUMINISTROS - MR. PACO\n`;
    textoPedido += `Fecha: ${new Date().toLocaleDateString()}\n`;
    textoPedido += `========================================\n`;
    insumosCriticos.forEach(ing => {
      const sugerido = ing.stock <= 0 ? 5000 : 3000;
      textoPedido += `- ${ing.nombre}: Falta reponer (Stock actual: ${ing.stock} ${ing.unidadMedida}). Pedido sugerido: +${sugerido} ${ing.unidadMedida}\n`;
    });
    
    navigator.clipboard.writeText(textoPedido);
    alert("🚀 ¡Lista de compras copiada al portapapeles! Lista para enviar al proveedor o supermercado.");
  };

  if (cargando) return <div className="p-8 font-bold text-orange-600">Cargando estanterías del almacén...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestor de Almacén</h1>
            <p className="text-gray-500 mt-1">Ingreso de mercancía y recálculo automático de costos.</p>
          </div>
          
          {/* BOTÓN ASISTENTE DE COMPRAS */}
          <button 
            onClick={copiarListaCompra}
            className={`px-5 py-3 rounded-xl font-bold text-sm shadow transition-all flex items-center ${insumosCriticos.length > 0 ? 'bg-orange-500 hover:bg-orange-600 text-white animate-pulse' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            <span className="mr-2">🛒</span> Asistente de Compras ({insumosCriticos.length})
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULARIO DE ENTRADA */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-green-100 p-2 rounded-lg mr-3">🚚</span> Registrar Entrada
              </h2>

              <form onSubmit={registrarEntrada} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Producto Recibido</label>
                  <select
                    value={ingredienteSeleccionado}
                    onChange={(e) => setIngredienteSeleccionado(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-black font-medium focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Selecciona un producto --</option>
                    {ingredientes.map((ing) => (
                      <option key={ing._id} value={ing._id}>
                        {ing.nombre} ({ing.categoria === 'materia_prima' ? 'Mat. Prima' : 'Pre-elab.'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        placeholder="Ej: 3000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                      />
                      {ingObj && <span className="absolute right-3 top-3 text-xs text-gray-400 font-bold">{ingObj.unidadMedida}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Costo Factura</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={costoTotal}
                        onChange={(e) => setCostoTotal(e.target.value)}
                        placeholder="Ej: 15000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                      />
                      {ingObj && <span className="absolute right-3 top-3 text-xs text-gray-400 font-bold">{ingObj.moneda}</span>}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Proveedor (Opcional)</label>
                  <input
                    type="text"
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    placeholder="Ej: Mercado Central"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={guardando || !ingredienteSeleccionado}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition disabled:opacity-50 mt-2"
                >
                  {guardando ? "Calculando Costos..." : "Confirmar al Almacén"}
                </button>
              </form>
            </div>
          </div>

          {/* TABLA DE ESTANTERÍAS */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Estado de las Estanterías</h3>
                <span className="text-sm font-bold text-gray-500">Total: {ingredientes.length} items</span>
              </div>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Producto</th>
                    <th className="p-4 font-bold">Costo Base Promedio</th>
                    <th className="p-4 font-bold text-right">Stock Actual</th>
                    <th className="p-4 font-bold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ingredientes.map(ing => (
                    <tr key={ing._id} className="hover:bg-orange-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{ing.nombre}</div>
                        <div className="text-xs text-gray-400">{ing.categoria === 'materia_prima' ? 'Mat. Prima' : 'Pre-elaborado'}</div>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-700">
                        {ing.costoPorUnidad} <span className="text-xs text-slate-400 font-bold">{ing.moneda} /{ing.unidadMedida}</span>
                      </td>
                      <td className={`p-4 text-right font-black text-lg ${ing.stock <= 0 ? 'text-red-500' : (ing.stock < 1000 ? 'text-yellow-500' : 'text-green-600')}`}>
                        {ing.stock} <span className="text-xs font-normal text-gray-500">{ing.unidadMedida}</span>
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
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}