import { Router } from 'express';
import { obtenerEmpleados, crearEmpleado , eliminarEmpleado } from '../controllers/UsuarioControllers';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddleware';

const router = Router();

// Solo el administrador (tú) puede ver y crear otros empleados
router.get('/', verificarToken, verificarRol(['admin']), obtenerEmpleados);
router.post('/', verificarToken, verificarRol(['admin']), crearEmpleado);
// Ruta para eliminar un empleado (solo accesible por el administrador)
router.delete('/:id', verificarToken, verificarRol(['admin']), eliminarEmpleado);
export default router;