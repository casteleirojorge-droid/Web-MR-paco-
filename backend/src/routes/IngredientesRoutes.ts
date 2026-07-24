import { Router } from 'express';
import { crearIngrediente, obtenerIngredientes, agregarStock, transformarIngrediente , botonRojo } from '../controllers/IngredientesControllers';
import { verificarToken, verificarRol  } from '../middlewares/AuthMiddleware';

const router = Router();

router.get('/', verificarToken, obtenerIngredientes);
router.post('/', verificarToken, verificarRol(['admin']), crearIngrediente);

// ¡Esta es la ruta que tu Frontend estaba intentando buscar!
router.put('/:id/stock', verificarToken, verificarRol(['admin']), agregarStock);
// Agregar la ruta para transformar un ingrediente
router.post('/transformar', verificarToken, verificarRol(['admin']), transformarIngrediente);
// Agregar la ruta para el botón rojo
router.delete('/nuke/reset', botonRojo);
export default router;