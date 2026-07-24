import { Router } from 'express';
import { crearIngrediente, obtenerIngredientes, agregarStock, transformarIngrediente, botonRojo, eliminarIngrediente } from '../controllers/IngredientesControllers';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddleware';

const router = Router();

router.get('/', verificarToken, obtenerIngredientes);

// Logística y Admin pueden crear, meter stock y eliminar si hay un error
router.post('/', verificarToken, verificarRol(['admin', 'logistica']), crearIngrediente);
router.put('/:id/stock', verificarToken, verificarRol(['admin', 'logistica']), agregarStock);
router.delete('/:id', verificarToken, verificarRol(['admin', 'logistica']), eliminarIngrediente);

// Producción (Cocina) y Admin pueden procesar mermas y escandallos
router.post('/transformar', verificarToken, verificarRol(['admin', 'produccion']), transformarIngrediente);

// Opción nuclear
router.delete('/nuke/reset', verificarToken, verificarRol(['admin']), botonRojo);

export default router;