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

    let totalDineroCaja = 0;
    let costoTotalIngredientes = 0; // NUEVO: El contador de gastos del día

    for (const linea of lineas) {
      const productoReal = await Producto.findById(linea.productoId);
      
      if (productoReal) {
        // Sumamos los ingresos (Precio de Venta x Cantidad)
        totalDineroCaja += (productoReal.precio * linea.cantidad);

        // Calculamos los gastos si el producto tiene receta
        if (productoReal.receta && productoReal.receta.length > 0) {
          for (const itemReceta of productoReal.receta) {
            const totalGramosConsumidos = itemReceta.cantidad * linea.cantidad;
            const idIngrediente = itemReceta.ingrediente;

            // Restamos stock Y recuperamos los datos del ingrediente al mismo tiempo
            const ingredienteActualizado = await Ingrediente.findByIdAndUpdate(
              idIngrediente, 
              { $inc: { stock: -totalGramosConsumidos } }
            );

            if (ingredienteActualizado) {
              // Gasto = Gramos o Uds consumidas * Lo que nos cuesta cada Gramo/Ud
              costoTotalIngredientes += (totalGramosConsumidos * ingredienteActualizado.costoPorUnidad);
            }
          }
        }
      }
    }

    // Guardamos AMBOS datos en el libro contable de hoy
    await CierreDiario.create({ 
      totalRecaudado: totalDineroCaja,
      costoTotal: costoTotalIngredientes 
    });
    
    res.status(200).json({ mensaje: 'Cierre procesado: Inventario actualizado y dinero guardado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al procesar el cierre.' });
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