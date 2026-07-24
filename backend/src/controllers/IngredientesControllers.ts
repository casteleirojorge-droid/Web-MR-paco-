import { Request, Response } from 'express';
import Ingrediente from '../models/Ingredientes'; // Corregido a singular
import Producto from '../models/Producto';
import EntradaAlmacen from '../models/EntradaAlmacen';

export const crearIngrediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const nuevoIngrediente = new Ingrediente(req.body);
    await nuevoIngrediente.save();
    res.status(201).json(nuevoIngrediente);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ mensaje: 'Este ingrediente ya existe en el catálogo.' });
      return;
    }
    res.status(500).json({ mensaje: 'Error al crear el ingrediente', detalle: error.message });
  }
};

export const obtenerIngredientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const ingredientes = await Ingrediente.find();
    res.status(200).json(ingredientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los ingredientes' });
  }
};

export const agregarStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Mapeo exacto de las variables que envía el frontend actual
    const body = req.body as { 
      cantidadAgregada?: any; 
      costoOriginal?: any; 
      monedaOriginal?: string; 
      tasaCambio?: any 
    };
    
    const cantidad = Number(body.cantidadAgregada);
    const costoOriginal = Number(body.costoOriginal);
    const monedaOriginal = body.monedaOriginal || 'CUP';
    const tasaCambio = Number(body.tasaCambio || 1);

    if (!cantidad || cantidad <= 0 || isNaN(costoOriginal) || costoOriginal < 0) {
      res.status(400).json({ mensaje: 'Cantidades o costo inválidos' });
      return;
    }

    const costoTotalCUP = costoOriginal * tasaCambio;

    const ingrediente = await Ingrediente.findById(id);
    if (!ingrediente) {
      res.status(404).json({ mensaje: 'Ingrediente no encontrado' });
      return;
    }

    // 1. Guardar el registro inmutable de la entrada
    const nuevaEntrada = new EntradaAlmacen({
      ingrediente: id,
      cantidadComprada: cantidad,
      costoOriginal: costoOriginal,
      tasaCambio: tasaCambio,
      costoTotalCUP: costoTotalCUP,
      moneda: monedaOriginal
    });
    await nuevaEntrada.save();

    // 2. Actualizar el inventario general con el promedio en CUP
    const stockActual = Number(ingrediente.stock || 0);
    const costoUnitarioActual = Number(ingrediente.costoPorUnidad || 0);

    const valorInventarioActual = stockActual * costoUnitarioActual;
    const nuevoStock = stockActual + cantidad;
    const nuevoCostoUnitario = (valorInventarioActual + costoTotalCUP) / nuevoStock;

    const ingredienteActualizado = await Ingrediente.findByIdAndUpdate(
      id,
      { 
        stock: nuevoStock,
        costoPorUnidad: nuevoCostoUnitario 
      },
      { new: true } 
    );

    res.status(200).json({ 
      mensaje: 'Entrada registrada y ticket guardado en EntradaAlmacen', 
      ingrediente: ingredienteActualizado 
    });
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const eliminarIngrediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ingredienteEliminado = await Ingrediente.findByIdAndDelete(id);
    if (!ingredienteEliminado) {
      res.status(404).json({ mensaje: 'Materia prima no encontrada' });
      return;
    }
    res.status(200).json({ mensaje: 'Eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar ingrediente' });
  }
};

export const transformarIngrediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idIngredienteDestino, cantidadGenerada, ingredientesOrigen } = req.body;

    for (const item of ingredientesOrigen) {
      const ingCrudo = await Ingrediente.findById(item.id);
      if (!ingCrudo || ingCrudo.stock < item.cantidadGastada) {
        res.status(400).json({ 
          mensaje: `Stock insuficiente de ${ingCrudo ? ingCrudo.nombre : 'materia prima'}.` 
        });
        return;
      }
    }

    let costoTotalLote = 0;
    for (const item of ingredientesOrigen) {
      const ingCrudoActualizado = await Ingrediente.findByIdAndUpdate(
        item.id,
        { $inc: { stock: -item.cantidadGastada } },
        { new: true }
      );
      if (ingCrudoActualizado) {
        costoTotalLote += (item.cantidadGastada * ingCrudoActualizado.costoPorUnidad);
      }
    }

    const costoUnitarioNuevo = costoTotalLote / cantidadGenerada;
    await Ingrediente.findByIdAndUpdate(
      idIngredienteDestino,
      { 
        $inc: { stock: cantidadGenerada },
        $set: { costoPorUnidad: costoUnitarioNuevo } 
      }
    );

    res.status(200).json({ mensaje: 'Producción realizada e inventario actualizado.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en proceso de transformación.' });
  }
};

export const botonRojo = async (req: Request, res: Response): Promise<void> => {
  try {
    await Producto.deleteMany({});
    await Ingrediente.deleteMany({});
    res.status(200).json({ mensaje: 'Base de datos reiniciada a cero.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al reiniciar la base de datos', error });
  }
};