import { Router } from 'express';
import { crearProducto, obtenerProductos, eliminarProducto } from '../controllers/ProductoControllers';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddleware';

const router = Router();

// Rutas limpias y directas
router.post('/', verificarToken, verificarRol(['admin']), crearProducto);
router.get('/', verificarToken, obtenerProductos);
router.delete('/:id', verificarToken, verificarRol(['admin']), eliminarProducto);

export default router;