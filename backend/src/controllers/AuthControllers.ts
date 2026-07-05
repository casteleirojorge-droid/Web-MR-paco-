import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario'; // Importamos el modelo de Usuario

// 1. Funcion para Registrar un nuevo trabajador (Solo deberian usarla los Jefes luego)
export const registrarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Comprobamos si el trabajador ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      res.status(400).json({ mensaje: 'El correo ya esta registrado' });
      return;
    }

    // Trituramos (encriptamos) la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Creamos la ficha del trabajador
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      passwordHash,
      rol
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Trabajador registrado con exito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar el usuario' });
  }
};

// 2. Funcion para Iniciar Sesion (Login) en la web
export const loginUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Buscamos al trabajador por su email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }

    // Comparamos la contraseña que escribe con la encriptada en la base de datos
    const passwordCorrecta = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordCorrecta) {
      res.status(400).json({ mensaje: 'Contraseña incorrecta' });
      return;
    }

    // Si todo es correcto, le fabricamos el "Pase Digital" (Token)
    // Guardamos dentro su ID y su ROL para saber que permisos tiene
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '8h' } // El pase caduca en 8 horas (un turno de trabajo)
    );

  // Devolvemos el token al frontend para que lo guarde y lo use en las siguientes peticiones
    res.status(200).json({ token, rol: usuario.rol, nombre: usuario.nombre });
  } catch (error) {
    console.log("EL ERROR REAL ES:", error); // Añade esta línea mágica
    res.status(500).json({ mensaje: 'Error al iniciar sesion' });
  }
};