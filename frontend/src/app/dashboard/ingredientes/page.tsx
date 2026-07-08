"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // Importamos tu nueva barra lateral inteligente

export default function GestorIngredientes() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [ingredientes, setIngredientes] = useState<any[]>([]);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("g"); // Por defecto gramos
  const [costo, setCosto] = useState("");
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
      const nuevoIngrediente = {
        nombre: nombre,
        unidadMedida: unidadMedida,
        costoPorUnidad: Number(costo)
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
        alert("✅ Materia prima registrada correctamente.");
        setNombre("");
        setCosto("");
        setUnidadMedida("g");
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

  const irA = (ruta: string) => router.push(ruta);

  if (cargando) return <div className="p-8 font-bold text-orange-600">Cargando base de datos...</div>;
  // Función para borrar un ingrediente
    const borrarIngrediente = async (id: string, nombre: string) => {
      if (!window.confirm(`¿Estás seguro de eliminar "${nombre}" del catálogo de materias primas?`)) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ingredientes/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setIngredientes(ingredientes.filter(ing => ing._id !== id));
        }   else {
          alert("No se puede eliminar. Verifique que no esté en uso en alguna receta.");
        }
      } catch (error) {
        alert("Error de conexión.");
      }
    };

return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* BARRA LATERAL */}
      <Sidebar />
      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-800">Materias Primas</h1>
          <p className="text-gray-500 mt-2 text-lg">Da de alta los ingredientes base antes de usarlos en tus recetas.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULARIO */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-orange-100 p-2 rounded-lg mr-3">➕</span> Nuevo Ingrediente
              </h2>
              
              <form onSubmit={crearIngrediente} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                  <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Salchicha Viena" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Se mide en:</label>
                  <select value={unidadMedida} onChange={e => setUnidadMedida(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white">
                    <option value="g">Gramos (g) - Para carnes, quesos...</option>
                    <option value="ml">Mililitros (ml) - Para salsas, líquidos...</option>
                    <option value="ud">Unidades (ud) - Para panes, latas, huevos...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Costo ($)</label>
                  <input type="number" step="0.01" required value={costo} onChange={e => setCosto(e.target.value)} placeholder="Ej: 0.50 (costo de 1 gramo o 1 ud)" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
                  <p className="text-xs text-gray-500 mt-2">* Este número es vital para calcular cuánto te cuesta preparar un plato después.</p>
                </div>

                <button type="submit" disabled={guardando} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition">
                  {guardando ? "Guardando..." : "Registrar en Base de Datos"}
                </button>
              </form>
            </div>
          </div>

          {/* LISTA ACTUAL */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Ingredientes Registrados</h3>
                <span className="text-sm font-bold text-gray-500">{ingredientes.length} totales</span>
              </div>
              
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Nombre</th>
                  <th className="p-4 font-bold">Medida</th>
                  <th className="p-4 font-bold text-right">Costo / Ud</th>
                  <th className="p-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ingredientes.map(ing => (
                  <tr key={ing._id} className="hover:bg-orange-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{ing.nombre}</td>
                    <td className="p-4 text-sm font-medium text-gray-600">
                      <span className="bg-gray-200 px-2 py-1 rounded text-xs">{ing.unidadMedida}</span>
                    </td>
                    <td className="p-4 text-right font-black text-gray-700">{ing.costoPorUnidad} $</td>
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