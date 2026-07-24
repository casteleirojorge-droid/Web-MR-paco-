import { Router } from 'express';
import { crearIngrediente, obtenerIngredientes, agregarStock, transformarIngrediente, botonRojo } from '../controllers/IngredientesControllers';
import { verificarToken, verificarRol } from '../middlewares/AuthMiddleware';

const router = Router();

// Cualquier usuario logueado necesita poder leer qué hay para que carguen las vistas
router.get('/', verificarToken, obtenerIngredientes);

// Logística y Admin pueden gestionar las estanterías y facturas
router.post('/', verificarToken, verificarRol(['admin', 'logistica']), crearIngrediente);
router.put('/:id/stock', verificarToken, verificarRol(['admin', 'logistica']), agregarStock);

// Producción (Cocina) y Admin pueden procesar mermas y escandallos
router.post('/transformar', verificarToken, verificarRol(['admin', 'produccion']), transformarIngrediente);

// Opción nuclear protegida a nivel máximo
router.delete('/nuke/reset', verificarToken, verificarRol(['admin']), botonRojo);

export default router;