import { Request, Response } from 'express';
import Ingrediente from '../models/Ingredientes';
import Producto from '../models/Producto';

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
    
    // Tipado explícito de la carga entrante
    const body = req.body as { cantidadAgregada?: any; costoTotal?: any };
    const cantidad = Number(body.cantidadAgregada);
    const costo = Number(body.costoTotal);

    if (!cantidad || cantidad <= 0 || isNaN(costo) || costo < 0) {
      res.status(400).json({ mensaje: 'Cantidades o costo inválidos' });
      return;
    }

    const ingrediente = await Ingrediente.findById(id);
    if (!ingrediente) {
      res.status(404).json({ mensaje: 'Ingrediente no encontrado' });
      return;
    }

    const stockActual = Number(ingrediente.stock || 0);
    const costoUnitarioActual = Number(ingrediente.costoPorUnidad || 0);

    const valorInventarioActual = stockActual * costoUnitarioActual;
    const nuevoStock = stockActual + cantidad;
    const nuevoCostoUnitario = (valorInventarioActual + costo) / nuevoStock;

    const ingredienteActualizado = await Ingrediente.findByIdAndUpdate(
      id,
      { 
        stock: nuevoStock,
        costoPorUnidad: nuevoCostoUnitario 
      },
      { new: true } 
    );

    res.status(200).json({ 
      mensaje: 'Entrada registrada y costo promediado', 
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