"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function GestorIngredientes() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [ingredientes, setIngredientes] = useState<any[]>([]);

  // Estados del formulario (Nuevos campos añadidos)
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("materia_prima"); // Por defecto comprado
  const [unidadMedida, setUnidadMedida] = useState("g"); // Por defecto gramos
  const [costo, setCosto] = useState("");
  const [moneda, setMoneda] = useState("CUP"); // Por defecto CUP
  const [guardando, setGuardando] = useState(false);

  const cargarIngredientes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingredientes`, {
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store"
      });
      if (respuesta.ok) {
        setIngredientes(await respuesta.json());
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarIngredientes();
  }, [router]);

  const crearIngrediente = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const token = localStorage.getItem("token");
      
      // Armamos el paquete con TODOS los datos que exige el backend
      const nuevoIngrediente = {
        nombre: nombre,
        categoria: categoria,
        unidadMedida: unidadMedida,
        costoPorUnidad: Number(costo),
        moneda: moneda
      };

      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingredientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(nuevoIngrediente)
      });

      if (respuesta.ok) {
        alert("¡Ingrediente registrado correctamente!");
        // Limpiamos el formulario
        setNombre("");
        setCosto("");
        setCategoria("materia_prima");
        setUnidadMedida("g");
        setMoneda("CUP");
        cargarIngredientes(); // Recargar la lista
      } else {
        const error = await respuesta.json();
        alert(`Error: ${error.mensaje}`);
      }
    } catch (error) {
      alert("Error al conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  // Función para borrar un ingrediente
  const borrarIngrediente = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombre}" del catálogo?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingredientes/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setIngredientes(ingredientes.filter(ing => ing._id !== id));
      } else {
        alert("No se puede eliminar. Verifique que no esté en uso en alguna receta.");
      }
    } catch (error) {
      alert("Error de conexión.");
    }
  };

  if (cargando) return <div className="p-8 font-bold text-orange-600">Cargando base de datos...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* BARRA LATERAL */}
      <Sidebar />
      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-800">Inventario Base</h1>
          <p className="text-gray-500 mt-2 text-lg">Gestiona tus materias primas y pre-elaborados (masas, mezclas).</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULARIO */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-orange-100 p-2 rounded-lg mr-3">➕</span> Nuevo Registro
              </h2>
              
              <form onSubmit={crearIngrediente} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                  <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Salchicha Viena o Masa Hamb." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                  <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white">
                    <option value="materia_prima">Materia Prima (Comprada)</option>
                    <option value="pre_elaborado">Pre-elaborado (Masa/Centro de prod.)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Se mide en:</label>
                  <select value={unidadMedida} onChange={e => setUnidadMedida(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white">
                    <option value="g">Gramos (g) - Carnes, quesos, masas...</option>
                    <option value="ml">Mililitros (ml) - Salsas, líquidos...</option>
                    <option value="ud">Unidades (ud) - Panes, latas, huevos...</option>
                  </select>
                </div>

                {/* DIVIDIMOS COSTO Y MONEDA EN DOS COLUMNAS */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Costo / Ud</label>
                    <input type="number" step="0.0001" required value={costo} onChange={e => setCosto(e.target.value)} placeholder="Ej: 5.78" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Moneda</label>
                    <select value={moneda} onChange={e => setMoneda(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white">
                      <option value="CUP">CUP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">* Este número es vital para calcular cuánto te cuesta preparar un plato.</p>

                <button type="submit" disabled={guardando} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition mt-4">
                  {guardando ? "Guardando..." : "Registrar en Base de Datos"}
                </button>
              </form>
            </div>
          </div>

          {/* LISTA ACTUAL */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Catálogo Registrado</h3>
                <span className="text-sm font-bold text-gray-500">{ingredientes.length} totales</span>
              </div>
              
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Nombre</th>
                  <th className="p-4 font-bold">Categoría</th>
                  <th className="p-4 font-bold">Medida</th>
                  <th className="p-4 font-bold text-right">Costo Unitario</th>
                  <th className="p-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ingredientes.map(ing => (
                  <tr key={ing._id} className="hover:bg-orange-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{ing.nombre}</td>
                    
                    {/* ETIQUETA DE CATEGORIA */}
                    <td className="p-4 text-sm font-medium">
                      <span className={`px-2 py-1 rounded text-xs ${ing.categoria === 'materia_prima' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {ing.categoria === 'materia_prima' ? 'Materia Prima' : 'Pre-elaborado'}
                      </span>
                    </td>

                    <td className="p-4 text-sm font-medium text-gray-600">
                      <span className="bg-gray-200 px-2 py-1 rounded text-xs">{ing.unidadMedida}</span>
                    </td>
                    
                    {/* COSTO Y MONEDA JUNTOS */}
                    <td className="p-4 text-right font-black text-gray-700">
                      {ing.costoPorUnidad} <span className="text-xs text-gray-400 font-bold">{ing.moneda}</span>
                    </td>

                    <td className="p-4 text-center">
                      <button 
                        onClick={() => borrarIngrediente(ing._id, ing.nombre)}
                        className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
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