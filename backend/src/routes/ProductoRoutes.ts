import { Router } from 'express';
import { crearProducto, obtenerProductos, eliminarProducto } from '../controllers/ProductoControllers';
import { verificarToken, esAdmin } from '../middlewares/AuthMiddleware';

const router = Router();

// Rutas limpias y directas
router.post('/', verificarToken, esAdmin, crearProducto);
router.get('/', verificarToken, obtenerProductos);
router.delete('/:id', verificarToken, esAdmin, eliminarProducto);

export default router;