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

// 3. Eliminar un empleado (Si es necesario)

export const eliminarEmpleado = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Usamos (req as any) para que TypeScript nos deje leer el usuario que metió el token
    const usuarioToken = (req as any).user;

    // Evitar que el propio usuario en sesión se elimine a sí mismo sin querer
    if (usuarioToken && usuarioToken.id === id) {
      res.status(400).json({ mensaje: 'No puedes rescindir tu propio acceso desde tu cuenta.' });
      return;
    }

    const empleadoEliminado = await Usuario.findByIdAndDelete(id);
    if (!empleadoEliminado) {
      res.status(404).json({ mensaje: 'Usuario no encontrado en la plantilla' });
      return;
    }
    res.status(200).json({ mensaje: 'Acceso rescindido y empleado dado de baja' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar la baja del empleado' });
  }
};