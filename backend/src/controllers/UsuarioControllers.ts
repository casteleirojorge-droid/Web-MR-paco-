import { Request, Response } from 'express';
import Usuario from '../models/Usuario'; 
import bcrypt from 'bcryptjs';

export const obtenerEmpleados = async (req: Request, res: Response): Promise<void> => {
  try {
    // Traemos todos los usuarios pero ocultamos el hash de la contraseña por seguridad
    const empleados = await Usuario.find({}, '-passwordHash'); 
    res.status(200).json(empleados);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cargar la plantilla de empleados' });
  }
};

export const crearEmpleado = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, rol } = req.body;
    
    // 1. Encriptamos la contraseña para que sea ilegible en la base de datos (Nivel Pro)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // 2. Guardamos al empleado usando el nombre de campo que exige tu modelo (passwordHash)
    const nuevoEmpleado = new Usuario({ 
      nombre, 
      email, 
      passwordHash, // ¡Aquí está la corrección!
      rol 
    });
    
    await nuevoEmpleado.save();
    
    res.status(201).json({ mensaje: 'Empleado registrado con éxito' });
  } catch (error: any) {
    console.error("Error al crear empleado:", error);
    res.status(500).json({ mensaje: `Fallo al registrar: ${error.message}` });
  }
};