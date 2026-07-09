import { Request, Response } from 'express';
import EntradaAlmacen from '../models/EntradaAlmacen';
import Ingrediente from '../models/Ingredientes';

export const registrarEntrada = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ingredienteId, cantidadComprada, costoTotal, proveedor, moneda } = req.body;

    // 1. Buscamos el ingrediente en el catálogo de las estanterías
    const ingrediente = await Ingrediente.findById(ingredienteId);
    if (!ingrediente) {
      res.status(404).json({ mensaje: 'El ingrediente no existe en el catálogo.' });
      return;
    }

    // 2. Filtro de seguridad: No mezclar divisas por accidente
    if (ingrediente.moneda !== moneda) {
      res.status(400).json({ 
        mensaje: `Error: Intentas dar entrada en ${moneda}, pero el catálogo dice que se paga en ${ingrediente.moneda}.` 
      });
      return;
    }

    // 3. LA MAGIA MATEMÁTICA: Cálculo del Costo Promedio Ponderado
    let nuevoCostoBase = costoTotal / cantidadComprada; // Si el almacén está a 0, el costo es directo
    
    if (ingrediente.stock > 0) {
       // Si ya había mercancía en la nevera, calculamos la mezcla del dinero viejo + el dinero nuevo
       const valorAlmacenViejo = ingrediente.stock * ingrediente.costoPorUnidad;
       nuevoCostoBase = (valorAlmacenViejo + costoTotal) / (ingrediente.stock + cantidadComprada);
    }

    // 4. Actualizamos la ficha del producto (sumamos stock y actualizamos el precio)
    ingrediente.stock += cantidadComprada;
    ingrediente.costoPorUnidad = Number(nuevoCostoBase.toFixed(4)); // Guardamos con 4 decimales para mayor precisión
    await ingrediente.save();

    // 5. Archivamos el "albarán" para el historial
    const nuevaEntrada = new EntradaAlmacen({
      ingrediente: ingredienteId,
      cantidadComprada,
      costoTotal,
      moneda,
      proveedor
    });
    await nuevaEntrada.save();

    // 6. Respondemos con éxito
    res.status(201).json({ 
      mensaje: 'Entrada registrada, stock sumado y precio actualizado con éxito.',
      nuevoStock: ingrediente.stock,
      nuevoCosto: ingrediente.costoPorUnidad
    });

  } catch (error) {
    console.error("Error crítico al registrar entrada:", error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};