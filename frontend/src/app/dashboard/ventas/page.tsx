"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // Importamos tu nueva barra lateral inteligente

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
}

export default function CierreManualJornada() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  
  // Estado para guardar las cantidades introducidas por el trabajador
  // Estructura: { [productoId]: cantidad }
  const [cantidades, setCantidades] = useState<{ [key: string]: string }>({});
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const cargarCarta = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/productos`, {
          headers: { "Authorization": `Bearer ${token}` },
          cache: "no-store"
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          setProductos(datos);
          
          // Inicializamos los inputs de todos los productos en vacío
          const inicial: { [key: string]: string } = {};
          datos.forEach((p: Producto) => {
            inicial[p._id] = "";
          });
          setCantidades(inicial);
        }
      } catch (error) {
        console.error("Error al cargar la carta:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarCarta();
  }, [router]);

  // Manejar el cambio numérico en cada celda
  const manejarCambioCantidad = (id: string, valor: string) => {
    // Solo permitir números enteros positivos o vacío
    if (valor === "" || /^\d+$/.test(valor)) {
      setCantidades({
        ...cantidades,
        [id]: valor
      });
    }
  };

  // Calcular la recaudación estimada en tiempo real según lo que escribe el usuario
  const calcularTotalRecaudado = () => {
    return productos.reduce((total, prod) => {
      const cant = Number(cantidades[prod._id]) || 0;
      return total + (prod.precio * cant);
    }, 0);
  };

  // Enviar el desglose completo del ticket de cierre al servidor
  const enviarCierreDiario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtramos solo los productos donde el trabajador puso una cantidad mayor que 0
    const lineasVenta = productos
      .filter(prod => (Number(cantidades[prod._id]) || 0) > 0)
      .map(prod => ({
        productoId: prod._id,
        cantidad: Number(cantidades[prod._id])
      }));

    if (lineasVenta.length === 0) {
      alert("⚠️ Por favor, introduce la cantidad de al menos un producto vendido.");
      return;
    }

    setProcesando(true);

    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pedidos/cierre-manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ lineas: lineasVenta })
      });

      if (respuesta.ok) {
        alert("✅ Reporte de cierre procesado correctamente. Caja sumada e inventario actualizado.");
        
        // Limpiamos el formulario para el día siguiente
        const limpias: { [key: string]: string } = {};
        productos.forEach(p => { limpias[p._id] = ""; });
        setCantidades(limpias);
        
        // Redirigimos al panel de control principal para ver los números actualizados
        router.push("/dashboard");
      } else {
        const error = await respuesta.json();
        alert(`Error al procesar el cierre: ${error.mensaje}`);
      }
    } catch (error) {
      alert("Error de conexión al enviar el cierre.");
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) return <div className="p-8 font-bold text-orange-600">Cargando hoja de cierre...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* BARRA LATERAL UNIVERSAL */}
      <Sidebar />
      {/* CUERPO DE TRABAJO */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-gray-800">Cierre de Caja Manual</h1>
          <p className="text-gray-500 mt-2 text-lg">Transcribe las unidades totales vendidas hoy según el ticket del TPV.</p>
        </header>

        <form onSubmit={enviarCierreDiario} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TABLA DE TRASCRIPCIÓN RÁPIDA */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Desglose del Reporte Diario</h2>
            </div>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Producto / Ítems del Menú</th>
                  <th className="p-4 font-bold text-right">Precio Unitario</th>
                  <th className="p-4 font-bold text-center w-40">Unidades Vendidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productos.map(prod => (
                  <tr key={prod._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900 text-base">{prod.nombre}</td>
                    <td className="p-4 text-right font-medium text-gray-600">{prod.precio.toFixed(2)} $</td>
                    <td className="p-4 text-center">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={cantidades[prod._id] || ""}
                        onChange={e => manejarCambioCantidad(prod._id, e.target.value)}
                        className="w-28 px-3 py-2 border border-gray-300 rounded-xl text-center font-black text-lg text-black bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CUADRO DE CONTROL Y CONFIRMACIÓN */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-md sticky top-8 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Resumen Financiero del Cierre</h3>
                <p className="text-xs text-slate-400 mb-6">El sistema calcula el dinero esperado cruzando las unidades con los precios de la carta.</p>
                
                <div className="border-t border-slate-800 pt-4 mb-6">
                  <span className="text-slate-400 block text-sm">Total Bruto Calculado</span>
                  <span className="text-4xl font-black text-green-400 block mt-1">
                    {calcularTotalRecaudado().toFixed(2)} $
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={procesando}
                className={`w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black py-4 rounded-xl shadow-lg text-lg transition-all transform hover:-translate-y-0.5 ${procesando ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {procesando ? "Guardando Cierre..." : "🔒 PROCESAR CIERRE DE JORNADA"}
              </button>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}