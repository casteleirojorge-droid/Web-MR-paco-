import { Request, Response } from 'express';
import Producto from '../models/Producto';

export const crearProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📥 Recibiendo petición para crear plato:", req.body);
    
    const { nombre, precio, receta } = req.body;
    
    const nuevoProducto = new Producto({ 
      nombre, 
      precio, 
      receta: receta || [] 
    });
    
    await nuevoProducto.save();
    console.log("✅ Plato guardado con éxito en la base de datos.");
    
    res.status(201).json(nuevoProducto);
  } catch (error: any) {
    console.error("❌ Error CRÍTICO al guardar producto:", error);
    res.status(500).json({ mensaje: `Fallo en el servidor: ${error.message}` });
  }
};

export const obtenerProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = await Producto.find().populate('receta.ingrediente');
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cargar la carta' });
  }
};

// Endpoint para eliminar un producto específico por su ID

export const eliminarProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productoEliminado = await Producto.findByIdAndDelete(id);
    
    if (!productoEliminado) {
      res.status(404).json({ mensaje: 'Plato no encontrado' });
      return;
    }
    
    res.status(200).json({ mensaje: 'Plato eliminado del menú correctamente' });
  } catch (error: any) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ mensaje: `Fallo en el servidor: ${error.message}` });
  }
};