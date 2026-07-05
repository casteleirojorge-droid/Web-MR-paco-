import { Router } from 'express';
import { crearIngrediente, obtenerIngredientes, agregarStock } from '../controllers/IngredientesControllers';
import { verificarToken, esAdmin } from '../middlewares/AuthMiddleware';

const router = Router();

router.get('/', verificarToken, obtenerIngredientes);
router.post('/', verificarToken, esAdmin, crearIngrediente);

// ¡Esta es la ruta que tu Frontend estaba intentando buscar!
router.put('/:id/stock', verificarToken, esAdmin, agregarStock);

export default router;