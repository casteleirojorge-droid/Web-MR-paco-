import { Router } from 'express';
import { obtenerEmpleados, crearEmpleado } from '../controllers/UsuarioControllers';
import { verificarToken, esAdmin } from '../middlewares/AuthMiddleware';

const router = Router();

// Solo el administrador (tú) puede ver y crear otros empleados
router.get('/', verificarToken, esAdmin, obtenerEmpleados);
router.post('/', verificarToken, esAdmin, crearEmpleado);

export default router;