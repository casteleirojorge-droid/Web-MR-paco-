"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // Importamos tu nueva barra lateral inteligente

export default function Dashboard() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [cajaHoy, setCajaHoy] = useState<number>(0); // Estado para guardar el dinero

  useEffect(() => {
    const inicializarPanel = async () => {
      const token = localStorage.getItem("token");
      const rol = localStorage.getItem("rol");

      if (!token || rol !== "admin") {
        router.push("/login");
        return;
      }

      try {
        // Pedimos los ingredientes y el dinero al mismo tiempo
        const peticionIngredientes = fetch("http://localhost:4000/api/ingredientes", {
          headers: { "Authorization": `Bearer ${token}` },
          cache: "no-store"
        });
        
        const peticionCaja = fetch("http://localhost:4000/api/pedidos/caja-hoy", {
          headers: { "Authorization": `Bearer ${token}` },
          cache: "no-store"
        });

        const [respuestaIngredientes, respuestaCaja] = await Promise.all([peticionIngredientes, peticionCaja]);

        if (respuestaIngredientes.ok) {
          const datos = await respuestaIngredientes.json();
          setIngredientes(datos);
        }

        if (respuestaCaja.ok) {
          const datosCaja = await respuestaCaja.json();
          setCajaHoy(datosCaja.cajaHoy); // Guardamos el dinero real aquí
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setCargando(false);
      }
    };

    inicializarPanel();
  }, [router]);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-2xl font-black text-orange-600 animate-pulse">
          Cargando Centro de Mando...
        </div>
      </div>
    );
  }

  const alertasCriticas = ingredientes.filter(ing => ing.stock <= 0);
  const alertasBajas = ingredientes.filter(ing => ing.stock > 0 && ing.stock < 1000);

  const irA = (ruta: string) => router.push(ruta);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-800">Centro de Mando</h1>
          <p className="text-gray-500 mt-2 text-lg">Monitorización del negocio en tiempo real.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* ¡LA TARJETA DE CAJA AHORA LEE EL DINERO REAL! */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Caja de Hoy</h3>
            <p className="text-4xl font-black text-green-600 mt-3">{cajaHoy.toFixed(2)} $</p>
            <p className="text-sm text-green-700 font-bold mt-3 bg-green-50 inline-block px-3 py-1 rounded-lg">
              Actualizado en vivo
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Inventario Total</h3>
            <p className="text-4xl font-black text-blue-600 mt-3">{ingredientes.length}</p>
            <p className="text-sm text-gray-400 mt-3 font-medium">Productos controlados</p>
          </div>

          <div className={`p-6 rounded-2xl shadow-md border ${alertasCriticas.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Alertas Críticas</h3>
            <p className={`text-4xl font-black mt-3 ${alertasCriticas.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {alertasCriticas.length}
            </p>
            <p className="text-sm text-gray-500 mt-3 font-medium">Faltas en almacén</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3 text-3xl">⚠️</span> Estado del Almacén
          </h2>
          
          {alertasCriticas.length === 0 && alertasBajas.length === 0 ? (
            <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-medium text-lg">
              Todo está en orden. Tienes stock suficiente para operar.
            </div>
          ) : (
            <div className="space-y-4">
              {alertasCriticas.map(ing => (
                <div key={ing._id} className="flex justify-between items-center p-5 bg-red-50 text-red-800 rounded-xl border border-red-200">
                  <div className="font-bold text-lg">🛑 ROTO DE STOCK: {ing.nombre}</div>
                  <div className="text-base font-black bg-red-200 px-4 py-2 rounded-lg shadow-sm">Stock: {ing.stock} {ing.unidadMedida}</div>
                </div>
              ))}
              
              {alertasBajas.map(ing => (
                <div key={ing._id} className="flex justify-between items-center p-5 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
                  <div className="font-bold text-lg">⚠️ STOCK BAJO: {ing.nombre}</div>
                  <div className="text-base font-black bg-yellow-200 px-4 py-2 rounded-lg shadow-sm">Quedan {ing.stock} {ing.unidadMedida}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}