import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos la interfaz Request para inyectar los datos del usuario logueado
export interface AuthRequest extends Request {
  usuario?: { id: string; rol: string };
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    return;
  }

  try {
    // Es vital que el JWT_SECRET coincida con el que usas al generar el token en el login
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; rol: string };
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(403).json({ mensaje: 'Token inválido o expirado.' });
  }
};

// Función de orden superior que recibe un array con los roles autorizados
export const verificarRol = (rolesPermitidos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({ mensaje: 'Acceso denegado. Permisos insuficientes para este departamento.' });
      return;
    }
    next();
  };
};