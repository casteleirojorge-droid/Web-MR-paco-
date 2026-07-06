"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function CentroProduccion() {
  const router = useRouter();
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  
  // Estados para el formulario
  const [destinoId, setDestinoId] = useState("");
  const [cantidadGenerada, setCantidadGenerada] = useState("");
  const [origenId, setOrigenId] = useState("");
  const [cantidadGastada, setCantidadGastada] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch("http://localhost:4000/api/ingredientes", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setIngredientes(await res.json());
    };
    cargarDatos();
  }, [router]);

  const registrarLote = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch("http://localhost:4000/api/ingredientes/transformar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          idIngredienteDestino: destinoId,
          cantidadGenerada: Number(cantidadGenerada),
          // Por simplicidad en la interfaz, permitimos gastar 1 ingrediente crudo principal por ahora (ej: Carne -> Masa Hamburguesa)
          ingredientesOrigen: [{ id: origenId, cantidadGastada: Number(cantidadGastada) }]
        })
      });

      if (respuesta.ok) {
        alert("👨‍🍳 ¡Lote de producción registrado! Inventario cuadrando...");
        setDestinoId(""); setCantidadGenerada(""); setOrigenId(""); setCantidadGastada("");
        // Recargar stock visual
        const res = await fetch("http://localhost:4000/api/ingredientes", { headers: { "Authorization": `Bearer ${token}` } });
        if (res.ok) setIngredientes(await res.json());
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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Centro de Producción (Cocina)</h1>
          <p className="text-gray-500 mt-1">Transforma materia prima cruda en elaboraciones intermedias (Lotes de masa, salsas, etc).</p>
        </header>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Registrar Nuevo Lote</h2>

          <form onSubmit={registrarLote} className="space-y-6">
            
            {/* SECCIÓN 1: LO QUE SALE (EL RESULTADO) */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <h3 className="font-bold text-green-800 mb-4 flex items-center">
                <span className="bg-green-200 p-2 rounded-lg mr-2">🟢</span> ¿Qué has fabricado? (Suma Stock)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Elaboración (Ej: Bolas de Pizza)</label>
                  <select value={destinoId} onChange={e => setDestinoId(e.target.value)} required className="w-full p-3 border rounded-lg bg-white">
                    <option value="">-- Selecciona --</option>
                    {ingredientes.map(ing => <option key={ing._id} value={ing._id}>{ing.nombre} ({ing.unidadMedida})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad Resultante</label>
                  <input type="number" min="1" value={cantidadGenerada} onChange={e => setCantidadGenerada(e.target.value)} required placeholder="Ej: 15" className="w-full p-3 border rounded-lg bg-white" />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: LO QUE SE GASTA (LA MATERIA PRIMA) */}
            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
              <h3 className="font-bold text-red-800 mb-4 flex items-center">
                <span className="bg-red-200 p-2 rounded-lg mr-2">🔴</span> ¿Qué has gastado? (Resta Stock)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Materia Prima (Ej: Harina / Carne)</label>
                  <select value={origenId} onChange={e => setOrigenId(e.target.value)} required className="w-full p-3 border rounded-lg bg-white">
                    <option value="">-- Selecciona --</option>
                    {ingredientes.map(ing => <option key={ing._id} value={ing._id}>{ing.nombre} (Stock: {ing.stock} {ing.unidadMedida})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad Gastada</label>
                  <input type="number" min="1" value={cantidadGastada} onChange={e => setCantidadGastada(e.target.value)} required placeholder="Ej: 3000" className="w-full p-3 border rounded-lg bg-white" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={guardando} className="w-full bg-orange-500 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:bg-orange-600 transition">
              {guardando ? "Procesando..." : "Confirmar Elaboración en Cocina"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}