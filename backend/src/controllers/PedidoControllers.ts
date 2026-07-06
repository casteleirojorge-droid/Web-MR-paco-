import { Request, Response } from 'express';
import Producto from '../models/Producto';
import Ingrediente from '../models/Ingredientes';
import CierreDiario from '../models/CierreDiario';

export const procesarCierreManual = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lineas } = req.body;

    if (!lineas || lineas.length === 0) {
      res.status(400).json({ mensaje: 'No hay datos en el cierre diario' });
      return;
    }

    // ─── PASO 1: SIMULACIÓN Y VERIFICACIÓN DE STOCK ───
    const requerimientos: { [key: string]: { nombre: string; cantidadNecesaria: number } } = {};

    for (const linea of lineas) {
      const productoReal = await Producto.findById(linea.productoId);
      if (productoReal && productoReal.receta && productoReal.receta.length > 0) {
        for (const itemReceta of productoReal.receta) {
          const idIngrediente = itemReceta.ingrediente.toString();
          const cantidadTotalItem = itemReceta.cantidad * linea.cantidad;

          if (!requerimientos[idIngrediente]) {
            const ingDb = await Ingrediente.findById(idIngrediente);
            requerimientos[idIngrediente] = {
              nombre: ingDb ? ingDb.nombre : 'Materia Prima',
              cantidadNecesaria: 0
            };
          }
          requerimientos[idIngrediente].cantidadNecesaria += cantidadTotalItem;
        }
      }
    }

    // Comprobamos si el stock físico en base de datos cubre la demanda del cierre
    for (const idIng in requerimientos) {
      const ingDb = await Ingrediente.findById(idIng);
      if (!ingDb || ingDb.stock < requerimientos[idIng].cantidadNecesaria) {
        res.status(400).json({
          mensaje: `Operación bloqueada por falta de existencias: No hay suficiente "${requerimientos[idIng].nombre}" en el almacén. Requerido: ${requerimientos[idIng].cantidadNecesaria}, Disponible: ${ingDb ? ingDb.stock : 0}.`
        });
        return; // Detiene la ejecución por completo
      }
    }

    // ─── PASO 2: PROCESAMIENTO REAL (SÓLO SI PASÓ EL FILTRO) ───
    let totalDineroCaja = 0;
    let costoTotalIngredientes = 0;

    for (const linea of lineas) {
      const productoReal = await Producto.findById(linea.productoId);
      if (productoReal) {
        totalDineroCaja += (productoReal.precio * linea.cantidad);

        if (productoReal.receta && productoReal.receta.length > 0) {
          for (const itemReceta of productoReal.receta) {
            const totalGramosConsumidos = itemReceta.cantidad * linea.cantidad;
            
            const ingredienteActualizado = await Ingrediente.findByIdAndUpdate(
              itemReceta.ingrediente,
              { $inc: { stock: -totalGramosConsumidos } },
              { new: true }
            );

            if (ingredienteActualizado) {
              costoTotalIngredientes += (totalGramosConsumidos * ingredienteActualizado.costoPorUnidad);
            }
          }
        }
      }
    }

    await CierreDiario.create({
      totalRecaudado: totalDineroCaja,
      costoTotal: costoTotalIngredientes
    });

    res.status(200).json({ mensaje: 'Cierre procesado con éxito. Caja e inventario consolidados.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno al procesar el cierre contable.' });
  }
};

export const obtenerCajaDeHoy = async (req: Request, res: Response): Promise<void> => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const cierresDeHoy = await CierreDiario.find({ fecha: { $gte: hoy } });
    const totalHoy = cierresDeHoy.reduce((acc, cierre) => acc + cierre.totalRecaudado, 0);
    res.status(200).json({ cajaHoy: totalHoy });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la caja.' });
  }
};

export const obtenerHistorialCierres = async (req: Request, res: Response): Promise<void> => {
  try {
    const cierres = await CierreDiario.find().sort({ fecha: -1 });
    res.status(200).json(cierres);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el historial contable.' });
  }
};