import { Request, Response } from 'express';
import Pedido from '../models/Pedido';

// Funcion para generar el Cierre de Caja del dia actual (Reporte Z)
export const obtenerCierreDiario = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Definimos el inicio y el fin del dia de hoy
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    // 2. La Tuberia de Agregacion (El motor estadistico de MongoDB)
    const cierre = await Pedido.aggregate([
      // Etapa 1 ($match): Filtramos para coger SOLO los pedidos creados hoy
      {
        $match: {
          createdAt: { $gte: inicioDia, $lte: finDia }
        }
      },
      // Etapa 2 ($group): Agrupamos esos pedidos y sacamos los calculos
      {
        $group: {
          _id: null, // Juntamos todo en un solo bloque
          totalCaja: { $sum: "$total" }, // Suma todos los campos 'total'
          cantidadPedidos: { $sum: 1 },  // Cuenta 1 por cada pedido encontrado
          ticketMedio: { $avg: "$total" } // Calcula la media matematica
        }
      }
    ]);

    // Si no hay ventas hoy, devolvemos todo en cero para que no de error
    if (cierre.length === 0) {
      res.status(200).json({ totalCaja: 0, cantidadPedidos: 0, ticketMedio: 0 });
      return;
    }

    // Devolvemos el resultado calculado al frontend
    res.status(200).json(cierre[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al calcular el cierre de caja' });
  }
};