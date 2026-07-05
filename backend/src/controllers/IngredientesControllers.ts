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