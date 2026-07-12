import { Router } from 'express';
import { crearIngrediente, obtenerIngredientes, agregarStock, transformarIngrediente , botonRojo } from '../controllers/IngredientesControllers';
import { verificarToken, esAdmin } from '../middlewares/AuthMiddleware';

const router = Router();

router.get('/', verificarToken, obtenerIngredientes);
router.post('/', verificarToken, esAdmin, crearIngrediente);

// ¡Esta es la ruta que tu Frontend estaba intentando buscar!
router.put('/:id/stock', verificarToken, esAdmin, agregarStock);
// Agregar la ruta para transformar un ingrediente
router.post('/transformar', verificarToken, esAdmin, transformarIngrediente);
// Agregar la ruta para el botón rojo
router.delete('/nuke/reset', botonRojo);
export default router;