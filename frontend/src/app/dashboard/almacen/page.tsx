"use client";

import { useState, useEffect } from "react";

export default function GestorAlmacen() {
  const [modoCrear, setModoCrear] = useState(false);
  
  // Estados para Ingresar Stock
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [costoFactura, setCostoFactura] = useState("");
  
  // Estados para Crear Producto Nuevo
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("materia_prima");
  const [nuevaUnidad, setNuevaUnidad] = useState("ud");
  const [nuevaMoneda, setNuevaMoneda] = useState("CUP");

  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica fetch a POST /api/ingredientes con stock 0
    // Al finalizar: setModoCrear(false), recargar dropdown y auto-seleccionar el nuevo producto.
  };

  const handleRegistrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica fetch a PUT /api/ingredientes/:id/stock recalculando costo promedio ponderado
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Gestor de Almacén</h1>
        <p className="text-slate-500">Ingreso de mercancía y recálculo automático de costos.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL IZQUIERDO: ACCIONES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-1">
          <div className="flex border-b border-gray-200 mb-6">
            <button 
              onClick={() => setModoCrear(false)}
              className={`pb-2 flex-1 text-sm font-semibold transition-colors ${!modoCrear ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              📥 Ingresar Stock
            </button>
            <button 
              onClick={() => setModoCrear(true)}
              className={`pb-2 flex-1 text-sm font-semibold transition-colors ${modoCrear ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              ➕ Crear Nuevo
            </button>
          </div>

          {!modoCrear ? (
            <form onSubmit={handleRegistrarEntrada} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto Recibido</label>
                <select 
                  value={productoSeleccionado} 
                  onChange={(e) => setProductoSeleccionado(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">-- Selecciona un producto --</option>
                  {/* Mapeo de ingredientes aquí */}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Ej: 3000" className="w-full border border-gray-300 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Total</label>
                  <input type="number" value={costoFactura} onChange={(e) => setCostoFactura(e.target.value)} placeholder="Ej: 15000" className="w-full border border-gray-300 rounded-lg p-2.5" />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-600 text-white font-semibold py-3 rounded-lg hover:bg-slate-700 transition">
                Confirmar al Almacén
              </button>
            </form>
          ) : (
            <form onSubmit={handleCrearProducto} className="space-y-4 bg-orange-50 p-4 rounded-lg border border-orange-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej: Tomate Pera" required className="w-full border border-gray-300 rounded-lg p-2.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5">
                    <option value="materia_prima">Materia Prima</option>
                    <option value="pre_elaborado">Pre-elaborado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                  <select value={nuevaUnidad} onChange={(e) => setNuevaUnidad(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5">
                    <option value="ud">Unidades (ud)</option>
                    <option value="g">Gramos (g)</option>
                    <option value="ml">Mililitros (ml)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition">
                Guardar en Catálogo
              </button>
            </form>
          )}
        </div>

        {/* PANEL DERECHO: ESTANTERÍAS (Sin cambios estructurales) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Estado de las Estanterías</h2>
          {/* Tabla de productos mapeada */}
        </div>
      </div>
    </div>
  );
}