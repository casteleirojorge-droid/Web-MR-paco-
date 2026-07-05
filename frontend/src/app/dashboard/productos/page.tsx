"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // Importamos tu nueva barra lateral inteligente

interface ItemReceta {
  ingredienteId: string;
  nombre: string;
  cantidad: number;
  unidad: string;
}

export default function GestorMenu() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  
  const [productos, setProductos] = useState<any[]>([]);
  const [ingredientesDb, setIngredientesDb] = useState<any[]>([]);

  const [nombrePlato, setNombrePlato] = useState("");
  const [precioPlato, setPrecioPlato] = useState("");
  const [recetaTemporal, setRecetaTemporal] = useState<ItemReceta[]>([]);
  
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState("");
  const [cantidadReceta, setCantidadReceta] = useState("");

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const [resProductos, resIngredientes] = await Promise.all([
        fetch("http://localhost:4000/api/productos", { headers: { "Authorization": `Bearer ${token}` }, cache: "no-store" }),
        fetch("http://localhost:4000/api/ingredientes", { headers: { "Authorization": `Bearer ${token}` }, cache: "no-store" })
      ]);

      if (resProductos.ok) setProductos(await resProductos.json());
      if (resIngredientes.ok) setIngredientesDb(await resIngredientes.json());
      
    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [router]);

  const agregarIngredienteAReceta = () => {
    if (!ingredienteSeleccionado || !cantidadReceta) return;
    const ingReal = ingredientesDb.find(ing => ing._id === ingredienteSeleccionado);
    if (!ingReal) return;

    setRecetaTemporal([...recetaTemporal, {
      ingredienteId: ingReal._id,
      nombre: ingReal.nombre,
      cantidad: Number(cantidadReceta),
      unidad: ingReal.unidadMedida
    }]);
    setIngredienteSeleccionado("");
    setCantidadReceta("");
  };

  const quitarDeReceta = (index: number) => {
    const nuevaReceta = [...recetaTemporal];
    nuevaReceta.splice(index, 1);
    setRecetaTemporal(nuevaReceta);
  };

  const guardarNuevoPlato = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      const recetaFormateada = recetaTemporal.map(item => ({
        ingrediente: item.ingredienteId,
        cantidad: item.cantidad
      }));

      const nuevoPlato = {
        nombre: nombrePlato,
        precio: Number(precioPlato),
        receta: recetaFormateada
      };

      const respuesta = await fetch("http://localhost:4000/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(nuevoPlato)
      });

      if (respuesta.ok) {
        alert("🍲 ¡Plato añadido al menú con éxito!");
        setNombrePlato("");
        setPrecioPlato("");
        setRecetaTemporal([]);
        cargarDatos();
      } else {
        const err = await respuesta.json();
        alert(`Error del Servidor: ${err.mensaje}`);
      }
    } catch (error) {
      alert("Error crítico al conectar con el servidor.");
    }
  };

  // Función para eliminar un plato
  const borrarPlato = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${nombre}" de la carta?`)) return;

    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(`http://localhost:4000/api/productos/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (respuesta.ok) {
        // Filtramos la lista visual para que el plato desaparezca al instante sin recargar la página
        setProductos(productos.filter(p => p._id !== id));
      } else {
        alert("Error al intentar eliminar el plato.");
      }
    } catch (error) {
      alert("Error de conexión al eliminar.");
    }
  };

  const irA = (ruta: string) => router.push(ruta);

  if (cargando) return <div className="p-8 font-bold text-orange-600">Cargando menú...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* BARRA LATERAL ACTUALIZADA CON LOGÍSTICA */}
      <Sidebar />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-800">Gestor de Menú</h1>
          <p className="text-gray-500 mt-2 text-lg">Crea platos nuevos y define sus escandallos.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* CREADOR DE PLATOS */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-orange-100 p-2 rounded-lg mr-3 text-xl">🍳</span> Nuevo Plato
            </h2>
            
            <form onSubmit={guardarNuevoPlato} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                  <input type="text" required value={nombrePlato} onChange={e => setNombrePlato(e.target.value)} placeholder="Ej: Pizza del Jefe" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio ($)</label>
                  <input type="number" step="0.01" required value={precioPlato} onChange={e => setPrecioPlato(e.target.value)} placeholder="Ej: 2100" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>

              {/* RECETA */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Construir Escandallo (Opcional)</h3>
                
                {recetaTemporal.length > 0 && (
                  <ul className="mb-4 space-y-2">
                    {recetaTemporal.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-white p-2 px-4 rounded-lg border border-gray-100 text-sm font-medium shadow-sm">
                        <span>{item.nombre} <span className="text-orange-600">({item.cantidad}{item.unidad})</span></span>
                        <button type="button" onClick={() => quitarDeReceta(idx)} className="text-red-500 font-bold hover:text-red-700">X</button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex space-x-2">
                  <select value={ingredienteSeleccionado} onChange={e => setIngredienteSeleccionado(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="">- Seleccionar ingrediente -</option>
                    {ingredientesDb.map(ing => (
                      <option key={ing._id} value={ing._id}>{ing.nombre}</option>
                    ))}
                  </select>
                  <input type="number" value={cantidadReceta} onChange={e => setCantidadReceta(e.target.value)} placeholder="Cant." className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <button type="button" onClick={agregarIngredienteAReceta} className="bg-slate-900 text-white font-bold px-4 rounded-lg hover:bg-slate-800 transition">
                    Añadir
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg">
                Guardar Plato en el Menú
              </button>
            </form>
          </div>

          {/* CARTA ACTUAL */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
              <div><span className="bg-blue-100 p-2 rounded-lg mr-3 text-xl">📋</span> Carta Actual</div>
            </h2>
            
            <div className="space-y-4">
              {productos.map(producto => (
                <div key={producto._id} className="p-5 border border-gray-200 rounded-xl hover:border-orange-300 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{producto.nombre}</h3>
                      <span className="text-lg font-black text-green-600">{producto.precio} $</span>
                    </div>
                    
                    {/* BOTÓN DE ELIMINAR */}
                    <button 
                      onClick={() => borrarPlato(producto._id, producto.nombre)}
                      className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                      title="Eliminar plato"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {producto.receta && producto.receta.length > 0 ? (
                      <div className="flex items-center">
                        <span className="mr-2 text-blue-500">📝</span>
                        Escandallo configurado ({producto.receta.length} ingredientes)
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-600">
                        <span className="mr-2">⚠️</span>
                        Sin escandallo (No descuenta stock)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}