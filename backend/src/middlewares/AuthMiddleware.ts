import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Pequeño ajuste para TypeScript: le decimos que la petición (Request) 
// ahora puede llevar dentro los datos del usuario que sacamos del token.
export interface AuthRequest extends Request {
  usuario?: any;
}

// BARRERA 1: ¿Tienes un pase digital válido?
export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Los pases digitales siempre se enseñan en la cabecera (Header) de la petición
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ mensaje: 'Acceso denegado. Se requiere iniciar sesión.' });
    return;
  }

  try {
    // La máquina lee el token usando la firma secreta del archivo .env
    const verificado = jwt.verify(token, process.env.JWT_SECRET as string);
    req.usuario = verificado; // Guardamos el rol y el ID en la memoria para la siguiente comprobación
    
    next(); // La palabra clave mágica: "Todo en orden, puedes pasar a la siguiente sala"
  } catch (error) {
    res.status(401).json({ mensaje: 'Pase digital inválido o caducado.' });
  }
};

// BARRERA 2: ¿Eres de Gerencia?
export const esAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Leemos lo que guardó la Barrera 1
  if (req.usuario && req.usuario.rol === 'admin') {
    next(); // Eres el administrador, puedes ver las finanzas
  } else {
    // Error 403 significa "Sé quién eres, pero no tienes nivel suficiente para estar aquí"
    res.status(403).json({ mensaje: 'Acceso restringido. Requiere nivel de administración.' });
  }
};