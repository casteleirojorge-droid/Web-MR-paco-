"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; // Importamos tu nueva barra lateral inteligente

export default function GestorEmpleados() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [rolUsuario, setRolUsuario] = useState<string | null>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rolAsignado, setRolAsignado] = useState("empleado");
  const [guardando, setGuardando] = useState(false);

  const cargarEmpleados = async () => {
    try {
      const token = localStorage.getItem("token");
      const miRol = localStorage.getItem("rol");
      setRolUsuario(miRol);

      // Si un empleado listo intenta entrar aquí poniendo la URL a mano, ¡lo echamos a ventas!
      if (!token || miRol !== "admin") {
        router.push("/dashboard/ventas");
        return;
      }

      const respuesta = await fetch("http://localhost:4000/api/usuarios", {
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store"
      });

      if (respuesta.ok) {
        setEmpleados(await respuesta.json());
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, [router]);

  const registrarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch("http://localhost:4000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ nombre, email, password, rol: rolAsignado })
      });

      if (respuesta.ok) {
        alert("✅ Empleado dado de alta en la plantilla.");
        setNombre(""); setEmail(""); setPassword(""); setRolAsignado("empleado");
        cargarEmpleados();
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

  if (cargando) return <div className="p-8 font-bold text-blue-600">Verificando credenciales...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* BARRA LATERAL INTELIGENTE */}
      <Sidebar />
      {/* CONTENIDO */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-800">Plantilla de Empleados</h1>
          <p className="text-gray-500 mt-2 text-lg">Gestiona el acceso de tus trabajadores al sistema.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULARIO DE ALTA */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 p-2 rounded-lg mr-3">👤</span> Nuevo Contrato
              </h2>
              
              <form onSubmit={registrarEmpleado} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Empleado</label>
                  <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Correo (Email de login)</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña de acceso</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Rol en el sistema</label>
                  <select value={rolAsignado} onChange={e => setRolAsignado(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="empleado">Camarero / Cajero (Acceso Restringido)</option>
                    <option value="admin">Administrador (Acceso Total)</option>
                  </select>
                </div>

                <button type="submit" disabled={guardando} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition mt-4">
                  {guardando ? "Registrando..." : "Dar de Alta"}
                </button>
              </form>
            </div>
          </div>

          {/* LISTA DE TRABAJADORES */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Plantilla Actual</h3>
              </div>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Nombre</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold text-center">Nivel de Acceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {empleados.map(emp => (
                    <tr key={emp._id} className="hover:bg-blue-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{emp.nombre}</td>
                      <td className="p-4 text-sm text-gray-600">{emp.email}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${emp.rol === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {emp.rol === 'admin' ? 'ADMINISTRADOR' : 'EMPLEADO'}
                        </span>
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