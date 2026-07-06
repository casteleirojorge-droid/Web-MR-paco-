import { Request, Response } from 'express';
import Ingrediente from '../models/Ingredientes';

// 1. Crear un ingrediente nuevo (Lo usábamos en Thunder Client)
export const crearIngrediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, unidadMedida, costoPorUnidad } = req.body;
    const nuevoIngrediente = new Ingrediente({ nombre, unidadMedida, costoPorUnidad });
    await nuevoIngrediente.save();
    res.status(201).json(nuevoIngrediente);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el ingrediente' });
  }
};

// 2. Leer todos los ingredientes (Para llenar las tablas del Frontend)
export const obtenerIngredientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const ingredientes = await Ingrediente.find();
    res.status(200).json(ingredientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los ingredientes' });
  }
};

// 3. LA FUNCIÓN ESTRELLA: Sumar mercancía de los camiones
export const agregarStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cantidadAgregada } = req.body;

    if (!cantidadAgregada || cantidadAgregada <= 0) {
      res.status(400).json({ mensaje: 'La cantidad debe ser mayor a 0' });
      return;
    }

    const ingredienteActualizado = await Ingrediente.findByIdAndUpdate(
      id,
      { $inc: { stock: cantidadAgregada } },
      { returnDocument: 'after' } // Esto asegura que obtenemos el documento actualizado
    );

    res.status(200).json({ 
      mensaje: 'Entrada de almacén registrada con éxito', 
      ingrediente: ingredienteActualizado 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el stock del almacén' });
  }
};

// 4. Eliminar un ingrediente (Si es necesario) 
export const eliminarIngrediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ingredienteEliminado = await Ingrediente.findByIdAndDelete(id);
    if (!ingredienteEliminado) {
      res.status(404).json({ mensaje: 'Materia prima no encontrada' });
      return;
    }
    res.status(200).json({ mensaje: 'Materia prima eliminada del inventario con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el ingrediente' });
  }
};

// 5. Transformar ingredientes (Ej: Harina + Agua + Sal = Masa)
export const transformarIngrediente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idIngredienteDestino, cantidadGenerada, ingredientesOrigen } = req.body;
    // ingredientesOrigen es un array: [{ id: "...", cantidadGastada: 3000 }]

    // 1. Verificamos que tengamos stock suficiente de las materias primas crudas ANTES de hacer nada
    for (const item of ingredientesOrigen) {
      const ingCrudo = await Ingrediente.findById(item.id);
      if (!ingCrudo || ingCrudo.stock < item.cantidadGastada) {
        res.status(400).json({ 
          mensaje: `Fallo en producción: No hay suficiente ${ingCrudo ? ingCrudo.nombre : 'materia prima'} en el almacén.` 
        });
        return;
      }
    }

    // 2. Si hay stock, procedemos a RESTAR las materias primas crudas
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

    // 3. SUMAMOS la cantidad al producto elaborado (y le calculamos su nuevo coste real)
    const costoUnitarioNuevo = costoTotalLote / cantidadGenerada;
    
    await Ingrediente.findByIdAndUpdate(
      idIngredienteDestino,
      { 
        $inc: { stock: cantidadGenerada },
        // Actualizamos el coste unitario por si los precios de la harina/carne han cambiado
        $set: { costoPorUnidad: costoUnitarioNuevo } 
      }
    );

    res.status(200).json({ mensaje: 'Producción registrada con éxito. Inventario actualizado.' });
  } catch (error) {
    console.error("Error en transformación:", error);
    res.status(500).json({ mensaje: 'Error al procesar la producción en cocina.' });
  }
};